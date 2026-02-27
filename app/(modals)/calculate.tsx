import React, { useEffect, useRef, useState } from "react";
// component
import { Text, View } from "@/components/Themed";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color";
import { useIsModalOpenStore } from "@/hooks/use-is-modal-open-store";

export default function calculate() {
  const themeColor = useCurrneThemeColor();
  const [selected, setSelected] = useState("kg");
  const [inputNumber, setInputNumber] = useState("");
  const { open, setOpen } = useIsModalOpenStore();

  const translateX = useSharedValue(0);
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const tabItemWidth = (tabContainerWidth - 12) / 2;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const generatePercentageValues = (input: string) => {
    const value = !input ? "0" : input;
    const num = parseFloat(value);

    return Array.from({ length: 22 }, (_, i) => {
      const percent = 110 - i * 5;
      const percentText = () => {
        if (percent === 110) {
          return `💪🏻 + 10%`;
        }
        if (percent === 105) {
          return `💪🏻 + 5%`;
        }
        if (percent === 100) {
          return `💪🏻`;
        }
        return `${percent}%`;
      };

      return {
        title: percentText(),
        value: `${Math.round((num * percent) / 100).toString()}${
          selected === "kg" ? "kg" : "lb"
        }`,
      };
    });
  };

  const onSelectedTab = (type: "lb" | "kg") => {
    translateX.value = withTiming(type === "kg" ? 0 : tabItemWidth, {
      duration: 250,
    });

    if (!inputNumber) {
      setInputNumber("0");
      setSelected(type);
      return;
    }
    const num = parseFloat(inputNumber);
    if (type === "lb") {
      const pound = Math.round(num * 2.20462).toString();
      setSelected("lb");
      setInputNumber(String(pound));
    } else {
      const kg = Math.round(num / 2.20462).toString();
      setSelected("kg");
      setInputNumber(String(kg));
    }
  };

  useEffect(() => {
    setOpen(true);
    return () => {
      setOpen(false);
    };
  }, [open]);

  return (
    <View style={{ flex: 1, paddingTop: 24 }}>
      <View
        style={styles(themeColor).tabContainer}
        onLayout={(e) => setTabContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: 6,
              top: 6,
              width: tabItemWidth,
              height: 36,
              borderRadius: 6,
              backgroundColor: themeColor.tint,
            },
            indicatorStyle,
          ]}
        />
        <TouchableOpacity
          onPress={() => onSelectedTab("kg")}
          style={styles(themeColor).tabItem}
        >
          <Text style={{ textAlign: "center" }}>킬로그램/kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSelectedTab("lb")}
          style={styles(themeColor).tabItem}
        >
          <Text style={{ textAlign: "center" }}>파운드/lb</Text>
        </TouchableOpacity>
      </View>
      <View style={styles(themeColor).inputContainer}>
        <TextInput
          keyboardType="numeric"
          placeholder="0"
          textAlign="right"
          style={[styles(themeColor).input, { color: themeColor.text }]}
          value={inputNumber}
          onChangeText={(value) => setInputNumber(value)}
          placeholderTextColor={themeColor.subText}
          returnKeyType="done"
          onFocus={() => setInputNumber("")}
        />
        <Text style={{ fontSize: 18 }}>{selected === "kg" ? "kg" : "lb"}</Text>
      </View>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 20,
          flexGrow: 1,
        }}
      >
        {generatePercentageValues(inputNumber)?.map((item, index) => (
          <View
            style={[
              styles(themeColor).listItem,
              index === 0 && {
                borderTopWidth: 1,
                borderTopColor: themeColor.itemColor,
              },
            ]}
            key={item.title}
          >
            <Text style={{ fontSize: 16, color: themeColor.text }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 16, color: themeColor.tint }}>
              {item.value}
            </Text>
          </View>
        ))}
        <View style={{ height: 320 }} />
      </ScrollView>
    </View>
  );
}

const styles = (color: any) =>
  StyleSheet.create({
    tabContainer: {
      borderWidth: 2,
      borderColor: color.tint,
      padding: 6,
      borderRadius: 12,
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 20,
    },
    tabItem: {
      flex: 1,
      height: 36,
      borderRadius: 6,
      justifyContent: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingVertical: 20,
      paddingHorizontal: 20,
      // borderBottomWidth: 1,
      // // borderColor: color.itemColor,
      // // borderWidth: 1,
    },
    input: {
      fontSize: 36,

      justifyContent: "flex-end",
      fontFamily: "sb-m",
      flex: 1,
    },
    listItem: {
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      borderColor: color.itemColor,
      paddingVertical: 20,
    },
  });
