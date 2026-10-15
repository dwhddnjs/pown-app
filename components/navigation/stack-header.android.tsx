import React, { useCallback, useEffect, useRef, useState } from "react";
// component
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import type { SearchBarProps } from "react-native-screens";
import {
  headerBarTop,
  headerTitleOffset,
} from "@/components/navigation/header-metrics";
import { BarBackground } from "@/components/bar-background";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useBackToClose } from "@/hooks/use-back-to-close";
// icon
import Ionicons from "@expo/vector-icons/Ionicons";

// iOS 내비 바와 같은 44 바 (자리는 header-metrics.android.ts의 headerBarTop)
const BAR_HEIGHT = 44;
// iOS 투명(blur) 헤더는 네이티브 바가 불투명 헤더보다 ⅓ 위에서 끝난다(안전영역 + 38⅓ / 38⅔) —
// 계획 폼 본문이 그만큼 위에서 시작하니 바 색 헤더(blurHeader)도 같이 올린다
const BLUR_BAR_LIFT = 1 / 3;
// 제목이 양옆 버튼(16 + 36)에 닿지 않게 비워 두는 폭
const TITLE_INSET = 64;

// 검색창 — iOS UISearchController를 시뮬레이터에서 잰 값 (iPhone 17 Pro, pt)
// 내비 바 바로 밑에 36 높이 칸, 좌우 16. 누르면 제목 줄이 사라지며 칸이 37 올라가고
// 오른쪽에 "취소"가 나온다
const SEARCH_FIELD_HEIGHT = 36;
const SEARCH_FIELD_TOP = 2 / 3;
const SEARCH_ACTIVE_LIFT = 37;
const SEARCH_CANCEL_WIDTH = 41;
// 칸 아래 여백 — 결과 목록이 iOS와 같은 자리에서 시작하게 하는 값
const SEARCH_BOTTOM = 8;
// iOS 시스템 색 — tertiarySystemFill(칸), secondaryLabel(아이콘·안내 문구)
const SEARCH_COLOR = {
  light: { field: "rgba(118,118,128,0.12)", hint: "rgba(60,60,67,0.6)" },
  dark: { field: "rgba(118,118,128,0.24)", hint: "rgba(235,235,245,0.6)" },
} as const;

type SearchFieldProps = {
  options: SearchBarProps;
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

const SearchField = ({ options, active, onActiveChange }: SearchFieldProps) => {
  const themeColor = useCurrentThemeColor();
  const color = SEARCH_COLOR[useColorScheme() ?? "light"];
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");

  const changeText = (value: string) => {
    setText(value);
    // 화면은 react-native-screens 검색창 이벤트 모양으로 받는다
    options.onChangeText?.({
      nativeEvent: { text: value },
    } as NativeSyntheticEvent<TextInputFocusEventData>);
  };

  const cancel = () => {
    changeText("");
    inputRef.current?.blur();
    onActiveChange(false);
  };
  // iOS처럼 검색 중엔 취소가 먼저 — 뒤로가기는 검색을 끝내고 화면은 남긴다
  useBackToClose(active, cancel);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [active, progress]);
  const fieldStyle = useAnimatedStyle(() => ({
    marginRight: 16 + progress.value * SEARCH_CANCEL_WIDTH,
  }));
  const cancelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [SEARCH_CANCEL_WIDTH, 0],
        ),
      },
    ],
  }));

  return (
    <View style={styles.searchRow}>
      <Animated.View
        style={[styles.field, { backgroundColor: color.field }, fieldStyle]}
      >
        <Ionicons name="search" size={20} color={color.hint} />
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={changeText}
          onFocus={() => onActiveChange(true)}
          placeholder={options.placeholder}
          placeholderTextColor={color.hint}
          selectionColor={themeColor.tint}
          cursorColor={themeColor.tint}
          returnKeyType="search"
          autoCorrect={false}
          style={[styles.input, { color: themeColor.text }]}
        />
        {text !== "" && (
          <TouchableOpacity onPress={() => changeText("")} hitSlop={8}>
            <Ionicons name="close-circle" size={21} color={color.hint} />
          </TouchableOpacity>
        )}
      </Animated.View>
      <Animated.View
        style={[styles.cancel, cancelStyle]}
        pointerEvents={active ? "auto" : "none"}
      >
        <TouchableOpacity onPress={cancel} hitSlop={8}>
          <Text style={[styles.cancelText, { color: themeColor.tint }]}>
            {options.cancelButtonText}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// 푸시 화면 헤더 — 네이티브 툴바 대신 iOS 내비 바 모양을 JS로 그린다.
// 화면들이 옵션으로 넘기는 닫기·저장 버튼·제목·검색창을 iOS와 같은 자리에 둔다
type StackHeaderProps = NativeStackHeaderProps & {
  // 헤더·탭바와 같은 바 색(BarBackground)을 칠한다 — 계획 폼
  bar?: boolean;
};

const StackHeader = ({ options, back, bar }: StackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const themeColor = useCurrentThemeColor();
  const {
    headerTitle,
    title,
    headerLeft,
    headerRight,
    headerTransparent,
    headerStyle,
    headerTitleStyle,
    headerSearchBarOptions,
  } = options;
  const [searchActive, setSearchActive] = useState(false);
  const onSearchActiveChange = useCallback(
    (active: boolean) => setSearchActive(active),
    [],
  );

  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = withTiming(searchActive ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [searchActive, lift]);
  // 높이는 그대로 두고 내용만 올린다 — 헤더 높이가 줄면 그 밑 목록이 따라 튄다(iOS는 안 움직인다)
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift.value * SEARCH_ACTIVE_LIFT }],
  }));
  const barStyle = useAnimatedStyle(() => ({ opacity: 1 - lift.value }));
  // 검색 중엔 iOS처럼 바가 칸 밑까지만 남는다. 헤더가 목록 위에 겹쳐 있어(headerTransparent)
  // 배경만 줄이면 목록은 그대로 있고 그 밑이 드러난다
  const searchBackgroundStyle = useAnimatedStyle(() => ({
    bottom: lift.value * SEARCH_ACTIVE_LIFT,
  }));

  const titleNode =
    typeof headerTitle === "function"
      ? headerTitle({ children: title ?? "" })
      : (headerTitle ?? title);
  const fill =
    StyleSheet.flatten(headerStyle)?.backgroundColor ?? themeColor.background;
  const backgroundColor =
    headerTransparent || headerSearchBarOptions ? "transparent" : fill;
  const Container = bar ? BarBackground : View;

  return (
    <Container
      style={[
        {
          paddingTop:
            (headerBarTop(insets.top) ?? insets.top) -
            (bar ? BLUR_BAR_LIFT : 0),
          paddingBottom: headerSearchBarOptions ? SEARCH_BOTTOM : 0,
          overflow: "hidden",
        },
        // 바 색 헤더는 BarBackground가 칠한다 — 여기서 색 키를 넘기면(투명·undefined라도) 그 색을
        // 덮어써 헤더 뒤의 내비게이션 기본 배경(라이트 회색·다크 검정)이 비친다
        !bar && { backgroundColor },
      ]}
    >
      {headerSearchBarOptions && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: fill },
            searchBackgroundStyle,
          ]}
        />
      )}
      <Animated.View style={contentStyle} pointerEvents="box-none">
        <Animated.View
          style={[styles.bar, barStyle]}
          pointerEvents={searchActive ? "none" : "box-none"}
        >
          <View pointerEvents="none" style={styles.titleWrap}>
            {typeof titleNode === "string" ? (
              // 글꼴은 루트 Stack이 모든 화면에 headerTitleStyle로 넘긴다
              <Text
                numberOfLines={1}
                style={[
                  { color: themeColor.text },
                  headerTitleStyle,
                  headerTitleOffset,
                ]}
              >
                {titleNode}
              </Text>
            ) : (
              titleNode
            )}
          </View>
          <View style={styles.side}>
            {headerLeft?.({ canGoBack: back !== undefined })}
          </View>
          <View style={[styles.side, styles.right]}>
            {headerRight?.({ canGoBack: back !== undefined })}
          </View>
        </Animated.View>
        {headerSearchBarOptions && (
          <SearchField
            options={headerSearchBarOptions}
            active={searchActive}
            onActiveChange={onSearchActiveChange}
          />
        )}
      </Animated.View>
    </Container>
  );
};

const renderStackHeader = (props: NativeStackHeaderProps) => (
  <StackHeader {...props} />
);

export const stackHeader = {
  header: renderStackHeader,
  // 푸시 전환도 iOS처럼 오른쪽에서 밀려 들어오고 뒤 화면이 살짝 물러난다 — 안드로이드 기본은
  // 페이드·확대라 다른 앱처럼 보인다. 화면이 slide_from_bottom을 주면 그쪽이 덮어쓴다
  animation: "ios_from_right" as const,
};

// 계획 폼 헤더 — iOS는 투명 헤더 + blur지만, 안드로이드 바 배경은 불투명이라 투명으로 둘
// 이유가 없다. 헤더를 본문 위 칸에 두고 iOS blur가 맨 위에서 보이는 색을 칠한다.
// (투명 헤더로 두면 react-navigation이 헤더 높이를 기본 툴바 56dp로 덮어써 본문이 내려간다)
export const blurHeader = {
  header: (props: NativeStackHeaderProps) => <StackHeader {...props} bar />,
};

// 헤더가 본문 위 칸에 있어 본문을 따로 내리지 않는다
export const useBlurHeaderInset = () => 0;

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  titleWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: TITLE_INSET,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    justifyContent: "flex-end",
  },
  searchRow: {
    marginTop: SEARCH_FIELD_TOP,
    flexDirection: "row",
    alignItems: "center",
  },
  field: {
    flex: 1,
    height: SEARCH_FIELD_HEIGHT,
    marginLeft: 16,
    paddingLeft: 7,
    // 지우기 버튼(ⓧ) 중심이 칸 오른쪽 끝에서 15.5 — iOS와 같은 자리
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    borderCurve: "continuous",
  },
  input: {
    flex: 1,
    height: SEARCH_FIELD_HEIGHT,
    fontSize: 17,
    // iOS 기본값 — 안드로이드 TextInput 기본 여백이 있으면 글자가 칸 아래로 처진다
    padding: 0,
  },
  cancel: {
    position: "absolute",
    right: 16,
  },
  cancelText: {
    fontSize: 17,
  },
});
