import React, { useRef } from "react";
// component
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// zustand
import { usePlanMenuStore } from "@/hooks/use-plan-menu-store";
// lib
import { formatTime } from "@/lib/function";
import { tEquipment, tWorkout } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

interface WeightDateProps {
  id: number;
  workout: string;
  weight: string;
  date: string;
  equipment: string;
  type: string;
  // 캘린더 모달에서만 ⋯를 감춘다. 예전엔 usePathname()으로 경로를 봤는데,
  // 라우터 컨텍스트를 구독하면 화면을 옮길 때마다 보이는 모든 카드가 리렌더된다.
  hideMenu?: boolean;
}

export const WeightDate = ({
  id,
  workout,
  weight,
  date,
  type,
  equipment,
  hideMenu,
}: WeightDateProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  // 메뉴는 앱에 하나만 있는 PlanMenu가 띄운다 — 행은 버튼 좌표만 올린다
  const openPlanMenu = usePlanMenuStore((state) => state.openPlanMenu);
  const anchorRef = useRef<View>(null);

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      openPlanMenu({ id, type, y, height, rightEdge: x + width });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <View style={styles.dateDropDown}>
        <Text style={[styles.date, { color: themeColor.subText }]}>
          {formatTime(date)}
        </Text>
        {!hideMenu && (
          <View ref={anchorRef} collapsable={false}>
            <TouchableOpacity onPress={onPress} style={{ paddingLeft: 16 }}>
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={themeColor.text}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text
        style={[styles.title, { color: themeColor.tintText }]}
      >{`${tEquipment(equipment, lang)} ${tWorkout(workout, lang)}`}</Text>
      <Text style={[styles.weight, { color: themeColor.text }]}>
        {t("workout.target", { weight })}{" "}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },

  dateDropDown: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  titleWeight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontFamily: "sb-m",
  },

  weight: {
    // fontSize: 16
    fontFamily: "sb-m",
  },

  date: {
    fontFamily: "sb-l",
  },
});
