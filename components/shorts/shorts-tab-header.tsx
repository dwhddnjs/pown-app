import React, { Fragment, createRef, useState } from "react";
import { useT } from "@/hooks/use-t";
// component
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
// zustand
import { ShortsSortTypes, useShortsStore } from "@/hooks/use-shorts-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePopover } from "@/hooks/use-popover";
// lib
import { TKey } from "@/lib/i18n";
// expo
import { BlurView } from "expo-blur";
import { Text } from "../themed";
// icon
import Feather from "@expo/vector-icons/Feather";

// 헤더는 탭 네비게이터가 그려서 화면 안의 ref에 닿지 못한다. 시트 자체는 헤더 높이에
// 잘리므로 화면(app/(drawer)/(tabs)/shorts.tsx)에 마운트하고, 여는 손잡이만 공유한다.
export const shortsGuideRef = createRef<BottomSheetModal>();

const SORT_LABEL: Record<ShortsSortTypes, TKey> = {
  latest: "shorts.sortLatest",
  oldest: "shorts.sortOldest",
};
const SORTS: ShortsSortTypes[] = ["latest", "oldest"];
const CHEVRON_SIZE = 16;
const CHEVRON_GAP = 4;
const MENU_WIDTH = 140;
// 헤더와 메뉴 사이 간격
const MENU_GAP = 6;

const ShortsTabHeader = () => {
  const t = useT();
  const themeColor = useCurrentThemeColor();
  const sort = useShortsStore((state) => state.sort);
  const setSort = useShortsStore((state) => state.setSort);
  const hasVideos = useShortsStore((state) => state.videos.length > 0);
  const { visible, open, close, style } = usePopover();
  const { width: windowWidth } = useWindowDimensions();
  // 메뉴는 바깥(화면 전체)을 눌러도 닫히도록 Modal로 띄워서 자리를 직접 잡는다.
  // 헤더 안에서 열면 같은 배경색에 위쪽 둥근 모서리가 묻힌다 — 헤더 바로 아래, 화면
  // 가운데(= 타이틀 아래)에 띄운다. 탭 헤더는 창 맨 위에서 시작해 높이가 곧 아래 경계다
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <BlurView
      intensity={80}
      tint="default"
      style={styles.blur}
      onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
    >
      <SafeAreaView>
        <View style={styles.container}>
          {/* 정렬할 영상이 없으면 정렬 대신 탭 이름을 둔다 — 빈 화면의 제목이 "최신순"으로
              읽히지 않게. 같은 글자 크기라 헤더 높이(useHeaderHeight)가 흔들리지 않는다 */}
          {hasVideos ? (
            <TouchableOpacity
              style={styles.title}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t("shorts.sort")}
              accessibilityValue={{ text: t(SORT_LABEL[sort]) }}
              onPress={open}
            >
              <Text style={{ fontSize: 16 }}>{t(SORT_LABEL[sort])}</Text>
              <Feather
                name={visible ? "chevron-up" : "chevron-down"}
                size={CHEVRON_SIZE}
                color={themeColor.text}
              />
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 16 }} accessibilityRole="header">
              {t("tab.shorts")}
            </Text>
          )}
          {/* 타이틀이 가운데 정렬이라 흐름에 넣으면 밀린다 — 오른쪽에 띄운다 */}
          <TouchableOpacity
            style={styles.guide}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("ai.guideOpen")}
            onPress={() => shortsGuideRef.current?.present()}
          >
            <Feather name="info" size={24} color={themeColor.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View
          style={[
            styles.menu,
            {
              top: headerHeight + MENU_GAP,
              left: (windowWidth - MENU_WIDTH) / 2,
              backgroundColor: themeColor.background,
            },
            style,
          ]}
        >
          {SORTS.map((item, index) => {
            const isSelected = item === sort;
            return (
              <Fragment key={item}>
                {index > 0 && (
                  <View
                    style={[
                      styles.menuLine,
                      { backgroundColor: themeColor.itemColor },
                    ]}
                  />
                )}
                <TouchableOpacity
                  style={styles.menuItem}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setSort(item);
                    close();
                  }}
                >
                  <Text
                    style={[
                      styles.menuText,
                      {
                        color: isSelected
                          ? themeColor.tintText
                          : themeColor.text,
                      },
                    ]}
                  >
                    {t(SORT_LABEL[item])}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check"
                      size={17}
                      color={themeColor.tintText}
                    />
                  )}
                </TouchableOpacity>
              </Fragment>
            );
          })}
        </Animated.View>
      </Modal>
    </BlurView>
  );
};

export default ShortsTabHeader;

const styles = StyleSheet.create({
  // alignItems:"center"를 주면 SafeAreaView가 콘텐츠 폭으로 쪼그라들어
  // 안쪽 width:"100%"가 화면 폭이 아니게 된다 — 타이틀이 중앙에서 밀리던 원인
  blur: {
    width: "100%",
    paddingBottom: 6,
  },
  container: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  // 글자+셰브론 묶음째 가운데 정렬하면 글자가 셰브론 폭의 절반(10pt)만큼 왼쪽으로
  // 밀린다 — 셰브론만큼 왼쪽을 비워 글자를 헤더 정중앙에 둔다
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: CHEVRON_GAP,
    paddingLeft: CHEVRON_SIZE + CHEVRON_GAP,
  },
  guide: {
    position: "absolute",
    right: 16,
  },
  // 운동계획 카드의 ⋯ 메뉴(components/workout-plan/plan-menu.tsx)와 같은 모양
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
    // 타이틀에서 아래로 자라나게
    transformOrigin: "top center",
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
    fontFamily: "sb-l",
  },
  menuLine: {
    height: 1,
    marginHorizontal: 8,
  },
});
