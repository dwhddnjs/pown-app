import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Text, View } from "../themed";
import { IconTitle } from "../icon-title";
import { usePlanStore } from "@/hooks/use-plan-store";
import { equipmentData } from "@/constants/constants";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tEquipmentShort } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";

export const EquipmentBox = () => {
  const { equipment, setPlanValue } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  const onPressEquipment = (item: string) => {
    setPlanValue("equipment", item);
    if (item === "맨몸") {
      setPlanValue("weight", "0");
    }
  };

  return (
    <View style={styles.container}>
      <IconTitle style={{ gap: 7 }}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={20}
          color={themeColor.tintText}
        />
        <Text style={{ fontSize: 16 }}>{t("plan.equipment")}</Text>
      </IconTitle>
      <View style={[styles.box, { borderColor: themeColor.tint }]}>
        {equipmentData.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.item,
              equipment === item && {
                backgroundColor: themeColor.tint,
                borderRadius: 8,
              },
            ]}
            onPress={() => onPressEquipment(item)}
          >
            <Text
              numberOfLines={1}
              style={[
                // 영어는 6칸 폭에 안 맞아 축약형을 쓰고 글자도 한 단계 줄인다
                lang === "en" && { fontSize: 13 },
                { color: themeColor.tintText },
                equipment === item && {
                  color: themeColor.text,
                },
              ]}
            >
              {tEquipmentShort(item, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
    flex: 1,
    paddingHorizontal: 20,
  },

  text: {},

  item: {
    // 6칸 균등 분할 — 선택 배경이 어느 항목에 들어가도 폭이 안 흔들린다
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },

  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
