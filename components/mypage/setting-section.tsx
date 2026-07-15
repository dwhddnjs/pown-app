import React from "react";
// component
import { StyleSheet, View } from "react-native";
import { Text } from "../themed";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface SettingSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingSection = ({ title, children }: SettingSectionProps) => {
  const themeColor = useCurrentThemeColor();
  const items = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      {!!title && (
        <Text style={[styles.label, { color: themeColor.subText }]}>
          {title}
        </Text>
      )}
      <View style={[styles.card, { backgroundColor: themeColor.itemColor }]}>
        {items.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < items.length - 1 && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: themeColor.background },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
