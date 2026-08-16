import { useMemo, useRef } from "react";
// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/themed";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { WorkoutFolderTree } from "./workout-folder-tree";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
// hook
import { useLanguage } from "@/hooks/use-user-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { transformWorkoutData } from "@/lib/date";
// expo
import { useRouter } from "expo-router";
// icons
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";

export const DrawerContent = (props: DrawerContentComponentProps) => {
  // 전체 구독이면 세트 완료 토글 같은 무관한 변경에도 드로어가 통째로 리렌더된다
  const workoutPlanList = useWorkoutPlanStore((state) => state.workoutPlanList);
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const t = useT();
  const { onSetDate } = useSelectDateStore();
  const { push } = useRouter();

  // 드로어는 닫혀 있어도 항상 마운트돼 있고, 세트 완료 토글은 workoutPlanList
  // 참조를 매번 새로 만든다 — memo만으로는 그 탭마다 전체 기록을 다시 훑는다.
  // 닫혀 있는 동안은 마지막 결과를 그대로 쓰고, 열릴 때 한 번만 최신화한다.
  // (drawerStatus는 여는 액션과 같은 렌더에 "open"이 되므로 빈 화면이 보이지 않는다)
  const isDrawerOpen = useDrawerStatus() === "open";
  const lastSortData = useRef<ReturnType<typeof transformWorkoutData>>([]);
  const sortData = useMemo(() => {
    if (!isDrawerOpen) return lastSortData.current;
    lastSortData.current = transformWorkoutData(workoutPlanList, lang);
    return lastSortData.current;
  }, [isDrawerOpen, workoutPlanList, lang]);

  const monthCount = sortData.reduce((acc, year) => acc + year.content.length, 0);
  const dayCount = sortData.reduce(
    (acc, year) =>
      acc + year.content.reduce((sum, month) => sum + month.content.length, 0),
    0,
  );

  const onSelectDate = (date: string) => {
    onSetDate(date);
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 18 }}>{t("drawer.title")}</Text>
            <Text style={[styles.counts, { color: themeColor.subText }]}>
              {t("drawer.counts", {
                folders: sortData.length + monthCount,
                files: dayCount,
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              // MY는 드로어 아래 탭이라, 닫지 않으면 이동해도 드로어가 덮는다
              props.navigation.closeDrawer();
              push("/my");
            }}
          >
            <Ionicons
              name="settings-sharp"
              size={24}
              color={themeColor.subText}
            />
          </TouchableOpacity>
        </View>
      </View>
      {workoutPlanList.length === 0 ? (
        <View style={styles.emptyFolder}>
          <MaterialIcons
            name="folder-off"
            size={20}
            color={themeColor.subText}
          />
          <Text style={{ color: themeColor.subText, fontFamily: "sb-l" }}>
            {t("drawer.empty")}
          </Text>
        </View>
      ) : (
        <DrawerContentScrollView
          {...props}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: themeColor.background }}
          contentContainerStyle={{ paddingTop: 12 }}
        >
          <WorkoutFolderTree data={sortData} onSelectDate={onSelectDate} />
        </DrawerContentScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 72,
    paddingBottom: 12,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counts: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  settingsButton: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  emptyFolder: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    marginTop: 12,
  },
});
