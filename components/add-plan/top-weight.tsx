import React, { useRef, useState } from "react";
// component
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "../Themed";
import { IconTitle } from "../IconTitle";
// icon
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons";
// hook
import { usePlanStore } from "@/hooks/use-plan-store";
import useCurrneThemeColor from "@/hooks/use-current-theme-color";

export const TopWeight = () => {
  const { weight, setPlanValue, weightType } = usePlanStore();
  const inputRef = useRef<TextInput>(null);
  const themeColor = useCurrneThemeColor();

  const onSetType = (type: "kg" | "lb") => {
    if (weight) {
      if (weightType === "kg") {
        const lb = Math.round(parseInt(weight) * 2.20462).toString();
        setPlanValue("weight", lb);
        setPlanValue("weightType", type);
      } else {
        const kg = Math.round(parseInt(weight) / 2.20462).toString();
        setPlanValue("weight", kg);
        setPlanValue("weightType", type);
      }
    } else {
      setPlanValue("weightType", type);
    }
  };

  return (
    <View style={{ paddingVertical: 12, gap: 10, paddingHorizontal: 20 }}>
      <IconTitle style={{ gap: 8 }}>
        <WeightIcon name="weight-kilogram" size={20} color={themeColor.tint} />
        <Text style={{ fontSize: 16 }}>목표 중량</Text>
      </IconTitle>

      <View
        style={{
          flexDirection: "row",
          gap: 4,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[styles.container, { borderColor: themeColor.subText }]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: themeColor.tint }]}
            maxLength={3}
            keyboardType="numeric"
            value={weight}
            onChangeText={(value) => setPlanValue("weight", value)}
            placeholder="0"
            returnKeyType="done"
            placeholderTextColor={themeColor.subText}
          />
          <Text>{weightType}</Text>
        </Pressable>
        <View
          style={[
            styles.typeButtonContainer,
            {
              borderColor: themeColor.subText,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.typeButton,
              weightType === "kg" && { backgroundColor: themeColor.tint },
            ]}
            onPress={() => onSetType("kg")}
          >
            <Text style={{ paddingBottom: 2 }}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              weightType === "lb" && { backgroundColor: themeColor.tint },
            ]}
            onPress={() => onSetType("lb")}
          >
            <Text>lb</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 2,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 3,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 10,
    // marginHorizontal: 24,
  },
  input: {
    textAlign: "right",
    minWidth: 52,
    fontSize: 16,
    fontFamily: "sb-l",
  },
  typeButton: {
    width: 42,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  typeButtonContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 50,
    alignSelf: "flex-end",
    padding: 4,
  },
});
