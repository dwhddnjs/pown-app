import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import Feather from "@expo/vector-icons/Feather";

interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  hideOverlay?: boolean;
}

export const Dialog = ({
  children,
  isOpen,
  onClose,
  hideOverlay,
}: DialogProps) => {
  const themeColor = useCurrentThemeColor();
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(0);
      opacity.value = withSpring(1);
    } else {
      translateY.value = withTiming(50, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(onClose)();
      });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isOpen) return null;

  const onPress = () => {
    translateY.value = withTiming(50, { duration: 150 });
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onClose)();
    });
  };

  return (
    // 부모 View(헤더 아래)를 기준으로 절대배치하면 "화면 중앙"이 아니라 그 영역의
    // 중앙에 떠서 아래로 밀린다 — Modal로 띄워 화면 전체를 기준으로 잡는다
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onPress}
    >
      <Pressable
        style={[
          styles.overlay,
          hideOverlay && { backgroundColor: "transparent" },
        ]}
        onPress={onPress}
      >
        {/* 키보드에 반응해 움직이지 않는다 — 화면 중앙에 뜬 다이얼로그는 하단이
          키보드 윗변보다 위라 애초에 가리지 않는데, 회피를 넣으면 포커스가
          들고 날 때마다 창이 오르내려 눈에 거슬린다 */}
        <View style={styles.centerer}>
          {/* 다이얼로그 안쪽(제목·여백)을 눌렀을 때 배경 Pressable로 버블링되어
            창이 닫히는 걸 막는다 — 태그 입력 중 키보드를 내리려다 값을 잃는다.
            responder는 자식이 먼저 잡으므로 안의 입력·버튼은 그대로 동작한다 */}
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={[
              styles.content,

              { backgroundColor: themeColor.itemColor },

              animatedStyle,
            ]}
          >
            {/* 화면 헤더의 HeaderIconButton과 달리 테두리 없이 아이콘만 —
              다이얼로그 안에서는 원형 보더가 내용보다 눈에 띈다 */}
            <View style={styles.closeRow}>
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                hitSlop={12}
                accessibilityRole="button"
              >
                <Feather name="x" size={22} color={themeColor.text} />
              </TouchableOpacity>
            </View>
            {children}
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal 안이라 이미 화면 전체가 루트다 — 절대배치·zIndex는 필요 없다
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centerer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    borderRadius: 16,
    paddingBottom: 20,
  },
  // 원형 보더(36)가 빠진 만큼 여백을 키워 아이콘 중심을 예전 자리에 둔다
  closeRow: {
    alignItems: "flex-end",
    paddingTop: 16,
    paddingRight: 18,
  },
});
