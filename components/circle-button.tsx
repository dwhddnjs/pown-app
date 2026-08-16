import { ComponentProps } from "react";
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// 떠 있는 원형 아이콘 버튼. 크기는 "맨 위로" 버튼을 가로 중앙에 맞출 때(marginLeft)도
// 쓰므로 한곳에서 계산한다.
// 숏츠 탭의 촬영 버튼(shorts.tsx의 addVideo)과 크기를 맞춘다.
export const FAB_SIZE = 50;
export const FAB_SIZE_SMALL = 36;
// 탭바 위로 띄우는 간격 — 숏츠 탭의 촬영 버튼과 같은 값을 쓴다(shorts.tsx).
// 기기마다 탭바 높이(+홈 인디케이터)가 달라 고정값을 쓰면 위치가 어긋난다.
export const FAB_TAB_GAP = 15;
export const FAB_GAP = 8;

interface CircleButtonProps {
  onPress: () => void;
  // 전부 아이콘만 있는 버튼이라 읽어줄 이름을 따로 준다
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const CircleButton = ({
  onPress,
  label,
  icon,
  iconSize = 30,
  style,
}: CircleButtonProps) => {
  const themeColor = useCurrentThemeColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={[
        styles.button,
        style,
        {
          backgroundColor: themeColor.background,
          borderColor: themeColor.tint,
        },
      ]}
    >
      <MaterialIcons name={icon} size={iconSize} color={themeColor.tintText} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 50,
  },
  // 리스트 안에 들어가는 버튼은 떠 있는 FAB보다 작게
  small: {
    width: FAB_SIZE_SMALL,
    height: FAB_SIZE_SMALL,
  },
});

export const circleButtonSmall = styles.small;
