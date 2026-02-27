import { Image, StyleSheet } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import { Text, View } from "../Themed";

export const EmptyVideos = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Image
        source={require("@/assets/images/empty.png")}
        style={{ width: 150, height: 200 }}
      />
      <Text
        style={{
          color: Colors.dark.subText,
          fontSize: 18,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        운동 숏츠가 없습니다. {"\n"}추가해주세요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({});
