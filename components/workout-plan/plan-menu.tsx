import { useEffect, useState } from "react";
// component
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { toast } from "sonner-native";
// zustand
import { PlanMenuTarget, usePlanMenuStore } from "@/hooks/use-plan-menu-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
// lib
import { useSafeAreaInsets } from "react-native-safe-area-context";
// expo
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePopover } from "@/hooks/use-popover";
import { useT } from "@/hooks/use-t";

const MENU_WIDTH = 120;
// 버튼과 메뉴 사이 간격
const MENU_GAP = 6;

/**
 * 운동계획 카드의 ⋯ 메뉴. 카드가 overflow:hidden이라 Modal로 띄운다.
 * 동시에 열리는 메뉴는 하나뿐이므로 앱 전체에 한 번만 마운트한다 (app/_layout.tsx).
 */
export const PlanMenu = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const { push } = useRouter();
  const pathname = usePathname();
  const isMultiPlan = pathname.includes("multi-plan");
  // 앱 최상위에 상시 마운트돼 있으니 셀렉터로 좁힌다 — 스토어를 통째로
  // 구조분해하면 세트 완료 토글 하나에도 루트가 리렌더된다
  const setRemovePlan = useWorkoutPlanStore((state) => state.setRemovePlan);
  const removeTempPlan = useMultiPlanStore((state) => state.removeTempPlan);
  const setEditingPlan = useMultiPlanStore((state) => state.setEditingPlan);
  const tempPlans = useMultiPlanStore((state) => state.tempPlans);
  const target = usePlanMenuStore((state) => state.target);
  const closePlanMenu = usePlanMenuStore((state) => state.closePlanMenu);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    visible: menuVisible,
    open: openMenu,
    close: closeMenu,
    style: menuStyle,
  } = usePopover();
  // 닫히는 동안에도 좌표가 필요해서 target이 비워진 뒤에도 마지막 값을 들고 있는다
  const [anchor, setAnchor] = useState<PlanMenuTarget | null>(null);
  // 위로 띄울지는 실제 높이를 알아야 정한다 — 처음 한 번 재고 계속 재사용
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    if (!target) {
      closeMenu();
      return;
    }
    setAnchor(target);
    openMenu();
  }, [target, openMenu, closeMenu]);

  const onEdit = () => {
    if (!anchor) return;
    closePlanMenu();
    if (isMultiPlan) {
      const plan = tempPlans.find((p) => p.id === anchor.id);
      if (plan) {
        setEditingPlan(plan);
        push("/workout/add-multi-plan");
      }
    } else {
      push(`/edit-plan/${anchor.type}/${anchor.id}`);
    }
  };

  const onDelete = () => {
    if (!anchor) return;
    closePlanMenu();
    if (isMultiPlan) {
      removeTempPlan(anchor.id);
    } else {
      setRemovePlan(anchor.id);
    }
    toast.success(t("workout.deleted"));
  };

  const below = (anchor?.y ?? 0) + (anchor?.height ?? 0) + MENU_GAP;
  // 아래로 펼치면 화면 밖으로 나가는 카드는 버튼 위로 띄운다
  const flipped =
    menuHeight > 0 && below + menuHeight > windowHeight - insets.bottom;

  return (
    <Modal
      visible={menuVisible}
      transparent
      animationType="none"
      // 안드로이드에서 모달 창이 상태바 아래에서 시작하면 measureInWindow 좌표와 어긋난다
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={closePlanMenu}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={closePlanMenu} />
      {anchor && (
        <Animated.View
          // 닫기가 시작되면(target=null) 바로 터치를 막아 이중 실행을 없앤다
          pointerEvents={target ? "auto" : "none"}
          onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}
          style={[
            styles.menu,
            {
              top: flipped ? anchor.y - menuHeight - MENU_GAP : below,
              right: windowWidth - anchor.rightEdge,
              // 버튼이 있는 모서리에서 자라나게
              transformOrigin: flipped ? "bottom right" : "top right",
              backgroundColor: themeColor.background,
              // borderColor: themeColor.divider,
            },
            menuStyle,
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
            <Text style={[styles.menuText, { color: themeColor.text }]}>
              {t("common.edit")}
            </Text>
            <Ionicons name="pencil" size={17} color={themeColor.text} />
          </TouchableOpacity>
          <View
            style={[styles.menuLine, { backgroundColor: themeColor.itemColor }]}
          />
          <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
            <Text style={[styles.menuText, { color: themeColor.fail }]}>
              {t("common.delete")}
            </Text>
            <Ionicons name="trash-outline" size={17} color={themeColor.fail} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    // borderWidth: 1,
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 15,
    lineHeight: 20,
    // Ionicons 글리프가 제 박스보다 1pt 아래에 그려져 글자만 위로 떠 보인다 — 실측 보정
    transform: [{ translateY: 1 }],
    fontFamily: "sb-l",
  },
  menuLine: {
    height: 1,
    marginHorizontal: 8,
  },
});
