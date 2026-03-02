import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { IconTitle } from "../IconTitle";
import { usePlanStore } from "@/hooks/use-plan-store";
import { equipmentData } from "@/constants/constants";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

export const EquipmentBox = () => {
  const { equipment, setPlanValue } = usePlanStore();
  const themeColor = useCurrentThemeColor();

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
          color={themeColor.tint}
        />
        <Text style={{ fontSize: 16 }}>기구 종류</Text>
      </IconTitle>
      <View style={[styles.box, { borderColor: themeColor.tint }]}>
        {equipmentData.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.item,
              equipment === item && {
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: themeColor.tint,
                borderRadius: 8,
              },
            ]}
            onPress={() => onPressEquipment(item)}
          >
            <Text
              style={[
                { color: themeColor.tint },
                equipment === item && {
                  color: themeColor.text,
                },
              ]}
            >
              {item}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  box: {
    flexDirection: "row",
    // alignSelf: "flex-start",
    justifyContent: "space-between",
    borderWidth: 2,

    borderRadius: 14,
    // marginHorizontal: 24,
    // flexWrap: "wrap",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
