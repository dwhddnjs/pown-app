import React, { useState } from "react";
// component
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// zustand
import { usePlanMenuStore } from "@/hooks/use-plan-menu-store";
// lib
import { formatTime } from "@/lib/date";
import { tEquipment, tWorkout } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

const ICON_SIZE = 20;

interface WeightDateProps {
  id: number;
  workout: string;
  weight: string;
  date: string;
  equipment: string;
  type: string;
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
  // 레이아웃 콜백 전에 눌려도 0이 들어가지 않도록 아이콘 크기로 시작한다
  const [iconBox, setIconBox] = useState({
    width: ICON_SIZE,
    height: ICON_SIZE,
  });

  // measureInWindow는 네이티브 헤더가 있는 화면(검색 등)에서 y가 헤더 높이만큼
  // 밀려 나온다 — 메뉴가 버튼에서 한참 떨어져 떴다. 터치 이벤트의 page 좌표는
  // 눌린 뷰의 실제 화면 좌표라 헤더 유무와 상관없이 맞는다.
  // locationX/Y의 기준은 "hit-test된 노드"다 — 버튼에 padding이 있으면 아이콘을
  // 직접 눌렀을 때와 여백을 눌렀을 때 기준이 달라져 값이 튄다. 그래서 버튼 프레임을
  // 아이콘에 딱 맞추고(여백은 hitSlop) 크기도 같은 노드에서 잰다.
  const onPress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { pageX, pageY, locationX, locationY } = e.nativeEvent;
    openPlanMenu({
      id,
      type,
      y: pageY - locationY,
      height: iconBox.height,
      rightEdge: pageX - locationX + iconBox.width,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <View style={styles.dateDropDown}>
        <Text style={[styles.date, { color: themeColor.subText }]}>
          {formatTime(date)}
        </Text>
        {!hideMenu && (
          <TouchableOpacity
            onPress={onPress}
            onLayout={(e) => setIconBox(e.nativeEvent.layout)}
            hitSlop={{ left: 16 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={ICON_SIZE}
              color={themeColor.text}
            />
          </TouchableOpacity>
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
