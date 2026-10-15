import { useState } from "react";
import {
  StyleSheet,
  Text as DefaultText,
  View as DefaultView,
  useColorScheme,
} from "react-native";

import Colors from "@/constants/colors";
import { sbLineHeight } from "@/constants/text-metrics";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const textStyle = [{ fontFamily: "sb-m" }, { color }, style];
  // 줄 높이를 명시한 글(여러 줄 문단)은 줄 수를 재서 안드로이드 높이를 iOS에 맞춘다 (text-metrics)
  const [lines, setLines] = useState(1);
  const box = sbLineHeight(
    textStyle,
    otherProps.children,
    otherProps.allowFontScaling,
    lines,
  );
  const measureLines = !!box && !!StyleSheet.flatten(style)?.lineHeight;

  return (
    <DefaultText
      style={[textStyle, box]}
      {...otherProps}
      onTextLayout={
        measureLines
          ? (e) => {
              setLines(e.nativeEvent.lines.length || 1);
              otherProps.onTextLayout?.(e);
            }
          : otherProps.onTextLayout
      }
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
