// component
import {
  AppState,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "@/components/Themed"
import { IconTitle } from "@/components/IconTitle"
import { UserDataCard } from "@/components/mypage/user-data-card"
import { toast } from "sonner-native"
// expo
import { useRouter } from "expo-router"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useRef } from "react"
import * as DocumentPicker from "expo-document-picker"

export default function TabTwoScreen() {
  const { onReset, ...result } = useUserStore()
  const themeColor = useCurrneThemeColor()
  const { push } = useRouter()
  const { workoutPlanList, onSetMockout } = userWorkoutPlanStore()
  const jsonData = JSON.stringify(workoutPlanList, null, 2)
  const fileUri = FileSystem.documentDirectory + "data.json"
  const appState = useRef(AppState.currentState)

  const saveJsonFile = async () => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
        })
        toast.success("운동계획이 파일로 저장되었습니다!")
      } else {
        console.log("공유 안됨")
      }
    } catch (error) {
      console.log("error: ", error)
    }
  }

  const pickJsonFile = async () => {
    try {
      const result = (await DocumentPicker.getDocumentAsync({
        type: "application/json",
      })) as any
      console.log("result: ", result)

      const jsonData = await FileSystem.readAsStringAsync(
        result.assets[0].uri,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      )
      onSetMockout(JSON.parse(jsonData))
      toast.success("운동계획 파일을 불러왔습니다!")

      console.log("성공??")
    } catch (error) {
      console.error("파일 선택 오류:", error)
    }
  }

  return (
    <View style={styles.container}>
      <UserDataCard />
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => saveJsonFile()}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tint}
            />
            <Text>저장</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => pickJsonFile()}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tint}
            />
            <Text>가져오기</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 내정보 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/user-info")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tint}
            />
            <Text>내정보 작성</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 3대중량 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/max-weights")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={20}
              color={themeColor.tint}
            />
            <Text>3대중량 기입</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 컬러모드 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/theme-mode")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={themeColor.tint}
            />
            <Text>컬러모드 선택</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 데이터 초기화 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/reset-data")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="database-remove"
              size={20}
              color={themeColor.tint}
            />
            <Text>데이터 초기화</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 14,
    paddingTop: 14,
  },

  settingsContainer: {
    gap: 12,
  },
  settings: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
})
