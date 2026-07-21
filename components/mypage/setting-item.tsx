import React from "react";
// component
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../themed";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";

interface SettingItemProps {
  icon?: React.ReactNode;
  title: string;
  value?: string;
  titleColor?: string;
  chevron?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

export const SettingItem = ({
  icon,
  title,
  value,
  titleColor,
  chevron,
  right,
  onPress,
}: SettingItemProps) => {
  const themeColor = useCurrentThemeColor();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}
    >
      {icon && (
        // <View
        //   style={[styles.iconBox, { backgroundColor: themeColor.background }]}
        // >
        <>{icon}</>
        // </View>
      )}
      <Text style={[styles.title, !!titleColor && { color: titleColor }]}>
        {title}
      </Text>
      {!!value && (
        <Text
          numberOfLines={1}
          style={[styles.value, { color: themeColor.subText }]}
        >
          {value}
        </Text>
      )}
      {right}
      {chevron && (
        <AntDesign name="right" size={15} color={themeColor.subText} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    // flex:1 축약(flexBasis 0% + flexShrink 1)이면 영어처럼 긴 라벨이 두 줄로 깨진다.
    // 내용 크기를 기준으로 잡고(auto) 줄어들지 않게 해서, 공간이 모자라면 value가 줄어들게 한다.
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    fontSize: 15,
  },
  value: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: "sb-l",
  },
});
