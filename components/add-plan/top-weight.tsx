import React, { useEffect, useRef } from "react";
// component
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Text, View } from "../themed";
import { IconTitle } from "../icon-title";
// icon
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons";
// hook
import { usePlanStore } from "@/hooks/use-plan-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// animation
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface TopWeightProps {
  onFocusScroll: (node: any) => void;
  currentScrollY: number;
}

export const TopWeight = ({
  onFocusScroll,
  currentScrollY,
}: TopWeightProps) => {
  const { weight, setPlanValue, weightType } = usePlanStore();
  const inputRef = useRef<TextInput>(null);
  const themeColor = useCurrentThemeColor();
  const t = useT();

  const BUTTON_WIDTH = 42;
  const PADDING = 4;
  const translateX = useSharedValue(weightType === "kg" ? 0 : BUTTON_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(weightType === "kg" ? 0 : BUTTON_WIDTH, {
      damping: 18,
      stiffness: 200,
    });
  }, [weightType]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onSetType = (type: "kg" | "lb") => {
    if (type === weightType) return;
    const parsed = parseFloat(weight);
    if (weight && !Number.isNaN(parsed)) {
      const converted = type === "lb" ? parsed * 2.20462 : parsed / 2.20462;
      setPlanValue("weight", (Math.round(converted * 10) / 10).toString());
    }
    setPlanValue("weightType", type);
  };

  return (
    <View style={{ paddingVertical: 12, gap: 10, paddingHorizontal: 20 }}>
      <IconTitle style={{ gap: 8 }}>
        <WeightIcon name="weight-kilogram" size={20} color={themeColor.tintText} />
        <Text style={{ fontSize: 16 }}>{t("plan.targetWeight")}</Text>
      </IconTitle>

      <View
        style={{
          flexDirection: "row",
          gap: 4,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => {
            inputRef.current?.focus();
          }}
          style={[styles.container, { borderColor: themeColor.tint }]}
        >
          <TextInput
            ref={inputRef}
            onFocus={() => {
              inputRef.current?.measure((x, y, w, h, px, py) => {
                const targetPosition = (currentScrollY + py) / 3;
                onFocusScroll(targetPosition);
              });
            }}
            style={[styles.input, { color: themeColor.tintText }]}
            maxLength={5}
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
              borderColor: themeColor.tint,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: themeColor.tint },
              indicatorStyle,
            ]}
          />
          <Pressable style={styles.typeButton} onPress={() => onSetType("kg")}>
            <Text style={{ paddingBottom: 2 }}>kg</Text>
          </Pressable>
          <Pressable style={styles.typeButton} onPress={() => onSetType("lb")}>
            <Text>lb</Text>
          </Pressable>
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
    width: 94,
    justifyContent: "flex-end",
  },
  input: {
    textAlign: "right",
    // minWidth: 52,
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
  },
  typeButtonContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 50,
    alignSelf: "flex-end",
    padding: 4,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 42,
    height: 26,
    borderRadius: 50,
  },
});
