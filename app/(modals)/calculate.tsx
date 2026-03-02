import React, { useEffect, useRef, useState } from "react";
// component
import { Text, View } from "@/components/Themed";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useIsModalOpenStore } from "@/hooks/use-is-modal-open-store";

export default function calculate() {
  const themeColor = useCurrentThemeColor();
  const [selected, setSelected] = useState("kg");
  const [inputNumber, setInputNumber] = useState("");
  const { open, setOpen } = useIsModalOpenStore();

  const inputRef = useRef<TextInput>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const [tabItemWidth, setTabItemWidth] = useState(0);

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
    if (selected === type) return;

    inputRef.current?.blur();

    Animated.timing(translateX, {
      toValue: type === "kg" ? 0 : tabItemWidth,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const num = parseFloat(inputNumber);
    const converted =
      !inputNumber || isNaN(num)
        ? "0"
        : type === "lb"
          ? Math.round(num * 2.20462).toString()
          : Math.round(num / 2.20462).toString();

    setTimeout(() => {
      setSelected(type);
      setInputNumber(converted);
    }, 50);
  };

  useEffect(() => {
    setOpen(true);
    return () => {
      setOpen(false);
    };
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: 24 }}>
      <View style={styles(themeColor).tabContainer}>
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
              transform: [{ translateX }],
            },
          ]}
        />
        <TouchableOpacity
          onPress={() => onSelectedTab("kg")}
          style={styles(themeColor).tabItem}
          onLayout={(e) => setTabItemWidth(e.nativeEvent.layout.width)}
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
          ref={inputRef}
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
