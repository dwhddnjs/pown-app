import { Image } from "react-native";
import { useT } from "@/hooks/use-t"
import React from "react";
import { Text, View } from "../themed";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

export const EmptyVideos = () => {
  const t = useT()
  const themeColor = useCurrentThemeColor();
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
          color: themeColor.subText,
          fontSize: 18,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        {t("shorts.empty")}
      </Text>
    </View>
  );
};
