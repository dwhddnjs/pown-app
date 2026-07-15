import { useState } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/button";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
import { toast } from "sonner-native";
// zustand
import { UserInfoTypes, useUserStore } from "@/hooks/use-user-store";
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";
import { useShortsStore } from "@/hooks/use-shorts-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const isValidUserInfo = (value: unknown): value is UserInfoTypes[] =>
  Array.isArray(value) &&
  value.every((item) => item && typeof item.createdAt === "string");

const isValidWorkoutPlan = (value: unknown): value is WorkoutPlanTypes[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item.id === "number" &&
      typeof item.createdAt === "string" &&
      typeof item.workout === "string" &&
      Array.isArray(item.condition) &&
      Array.isArray(item.setWithCount),
  );

export default function ResetData() {
  const { onResetPlanList, onSetMockout, workoutPlanList } =
    useWorkoutPlanStore();

  const { userInfo, onReset, setUser } = useUserStore();
  const { onResetVideo } = useShortsStore();
  const { back } = useRouter();
  const themeColor = useCurrentThemeColor();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const jsonFile = {
    user: userInfo,
    workoutPlan: workoutPlanList,
  };
  const jsonData = JSON.stringify(jsonFile, null, 2);
  const fileUri = FileSystem.documentDirectory + "pown.json";

  const saveJsonFile = async () => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await isAvailableAsync()) {
        await shareAsync(fileUri, {
          mimeType: "application/json",
        });
      } else {
        toast.error("이 기기에서는 파일 공유를 사용할 수 없어요.");
      }
    } catch (error) {
      toast.error("백업 파일 저장 중 오류가 발생했습니다.");
    }
  };

  const pickJsonFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result?.assets) {
        const jsonData = await FileSystem.readAsStringAsync(
          result?.assets[0]?.uri,
          {
            encoding: FileSystem.EncodingType.UTF8,
          },
        );
        const { user, workoutPlan } = JSON.parse(jsonData);
        if (!isValidUserInfo(user) || !isValidWorkoutPlan(workoutPlan)) {
          return toast.error("Pown 백업 파일이 아니에요. 파일을 확인해주세요.");
        }
        setUser("userInfo", user);
        onSetMockout(workoutPlan);
        toast.success("운동계획 파일을 불러왔습니다!");
      }
    } catch (error) {
      toast.error("복원 중 오류가 발생했습니다. 파일을 확인해주세요.");
    }
  };

  const onSubmit = () => {
    setIsResetDialogOpen(false);
    onResetPlanList();
    onReset();
    onResetVideo();
    toast.success("모든 데이터가 초기화 되었습니다");
    back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tint }]}>
          당신이 기록한 운동 계획을 보관하세요.
        </Text>
        <Text style={[styles.desc, { color: themeColor.subText }]}>
          앱을 삭제하면 기록 했던 모든 운동 계획이 삭제됩니다. 나중에 당신이
          돌아올 수 있다는 여지를 두기 위해 백업 파일로 저장해서 보관하는건
          어떨까요?
        </Text>
      </View>
      <SettingSection title="백업 · 복원">
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="tray-arrow-up"
              size={20}
              color={themeColor.tint}
            />
          }
          title="백업"
          value="JSON 파일로 내보내기"
          onPress={() => saveJsonFile()}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="tray-arrow-down"
              size={20}
              color={themeColor.tint}
            />
          }
          title="복원"
          value="백업 파일 불러오기"
          onPress={() => pickJsonFile()}
        />
      </SettingSection>
      <SettingSection title="초기화">
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={themeColor.fail}
            />
          }
          title="모든 데이터 초기화"
          titleColor={themeColor.fail}
          onPress={() => {
            toast.success("tapped");
            setIsResetDialogOpen(true);
          }}
        />
      </SettingSection>
      {isResetDialogOpen && (
        <Dialog
          isOpen={isResetDialogOpen}
          onClose={() => setIsResetDialogOpen(false)}
          modalHeight={300}
        >
          <View
            style={{
              backgroundColor: themeColor.itemColor,
              paddingHorizontal: 20,
              gap: 24,
            }}
          >
            <View style={{ backgroundColor: themeColor.itemColor, gap: 4 }}>
              <Text style={{ fontSize: 18 }}>
                정말 모든 데이터를 삭제할까요?
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: themeColor.subText,
                  fontFamily: "sb-l",
                }}
              >
                * 운동 기록·내정보·숏츠가 모두 삭제되며 복구할 수 없어요.
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: themeColor.itemColor,
                gap: 12,
              }}
            >
              <Button
                type="solid"
                style={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: themeColor.subText,
                }}
                onPress={() => setIsResetDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="solid"
                style={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: themeColor.fail,
                }}
                onPress={onSubmit}
              >
                삭제하기
              </Button>
            </View>
          </View>
        </Dialog>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
});
