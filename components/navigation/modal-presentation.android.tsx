import React, { useMemo } from "react";
// component
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { headerTitleFont } from "@/components/navigation/screen-options";
import { headerTitleOffset } from "@/components/navigation/header-metrics";
import { BarBackground } from "@/components/bar-background";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

// 시트 위로 아래 화면이 살짝 보이게 남기는 틈 — iOS page sheet와 비슷하게
const TOP_GAP = 10;
const SHEET_RADIUS = 16;
const HEADER_HEIGHT = 56;

type HeaderButtonRender = (props: { canGoBack: boolean }) => React.ReactNode;

type SheetHeaderProps = {
  options: {
    title?: string;
    headerTitle?: string | ((props: { children: string }) => React.ReactNode);
    headerLeft?: HeaderButtonRender;
    headerRight?: HeaderButtonRender;
  };
};

// 안드로이드 시트에는 네이티브 앱바가 붙지 않는다(react-native-screens) — 화면들이 옵션으로
// 넘기는 닫기 버튼·제목·저장 버튼을 여기서 같은 자리에 그린다
const SheetHeader = ({
  options,
  bar,
}: SheetHeaderProps & {
  // 헤더·탭바와 같은 바 색 — iOS에서 blur 헤더를 쓰는 모달(루틴에 넣을 계획)
  bar?: boolean;
}) => {
  const themeColor = useCurrentThemeColor();
  const { headerTitle, title, headerLeft, headerRight } = options;
  const titleNode =
    typeof headerTitle === "function"
      ? headerTitle({ children: title ?? "" })
      : (headerTitle ?? title);

  const Container = bar ? BarBackground : View;

  return (
    <Container
      style={[
        styles.header,
        !bar && { backgroundColor: themeColor.background },
      ]}
    >
      <View style={styles.side}>{headerLeft?.({ canGoBack: true })}</View>
      {typeof titleNode === "string" ? (
        <Text
          numberOfLines={1}
          style={[
            headerTitleFont,
            styles.title,
            { color: themeColor.text },
            headerTitleOffset,
          ]}
        >
          {titleNode}
        </Text>
      ) : (
        titleNode
      )}
      <View style={[styles.side, styles.right]}>
        {headerRight?.({ canGoBack: true })}
      </View>
    </Container>
  );
};

const renderSheetHeader = (props: SheetHeaderProps) => (
  <SheetHeader {...props} />
);

// 시트 헤더를 바 색으로 — 모달 옵션 뒤에 펼친다
export const modalBarHeader = {
  header: (props: SheetHeaderProps) => <SheetHeader {...props} bar />,
};

// 모달은 머티리얼 바텀시트로 띄운다 — 그냥 modal로 두면 안드로이드는 일반 화면처럼 옆에서
// 밀려 들어와 모달인지 알 수 없다. 상태바 아래 틈만 남기고 덮어 iOS page sheet처럼 보이고,
// 아래로 끌거나 뒤로가기로 닫힌다
export const useModalPresentation = () => {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  return useMemo(
    () => ({
      presentation: "formSheet" as const,
      sheetAllowedDetents: [(height - top - TOP_GAP) / height],
      sheetCornerRadius: SHEET_RADIUS,
      header: renderSheetHeader,
    }),
    [height, top],
  );
};

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  // 제목이 가운데 오도록 양옆 칸 폭을 같게 둔다
  side: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    justifyContent: "flex-end",
  },
  title: {
    flexShrink: 1,
    textAlign: "center",
  },
});
