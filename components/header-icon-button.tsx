// component
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// icon
import Feather from "@expo/vector-icons/Feather";

type HeaderIconType = "close" | "back" | "down" | "save";

interface HeaderIconButtonProps {
  type: HeaderIconType;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// 모든 헤더 아이콘 버튼은 동일한 원형 크기를 공유해 통일감을 유지한다.
const BUTTON_SIZE = 36;

const ICON: Record<
  HeaderIconType,
  React.ComponentProps<typeof Feather>["name"]
> = {
  close: "x",
  back: "chevron-left",
  down: "chevron-down",
  save: "check",
};

const ICON_SIZE: Record<HeaderIconType, number> = {
  close: 20,
  back: 24,
  down: 24,
  save: 20,
};

export const HeaderIconButton = ({
  type,
  onPress,
  style,
}: HeaderIconButtonProps) => {
  const themeColor = useCurrentThemeColor();
  const isSave = type === "save";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={8}
      style={[
        styles.button,
        isSave
          ? { backgroundColor: themeColor.tint }
          : { borderWidth: 1, borderColor: themeColor.text },
        style,
      ]}
    >
      <Feather
        name={ICON[type]}
        size={ICON_SIZE[type]}
        color={isSave ? "#fff" : themeColor.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
