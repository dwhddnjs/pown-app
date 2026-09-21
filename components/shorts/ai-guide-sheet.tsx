import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
// component
import { StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/button";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// expo
import { Image } from "expo-image";

type AiGuideSheetProps = {
  // 분석 화면에서만 넘긴다 — 있으면 동의 문구와 "광고 보고 분석하기" 버튼이 붙는다.
  // 촬영 화면에서는 읽기 전용이라 닫기 버튼만 둔다.
  onStart?: () => void;
};

// 항목은 제목/설명 한 쌍뿐이라 컴포넌트로 쪼개지 않고 키 조각만 돈다.
// 키를 여기서 만들기 때문에 i18n에 ai.guide{X}·ai.guide{X}Desc가 없으면 타입에서 걸린다.
// 분석 전 확인 다이얼로그도 같은 목록을 쓴다 — 가이드와 조건이 어긋나면 안 된다
export const GUIDE_KEYS = ["Angle", "Frame", "Reps", "Light"] as const;

const CONTENT_PADDING = 20;
const ILLUST_GAP = 10;

// AI가 보는 건 영상에서 뽑은 정지 프레임 몇 장뿐이라(lib/ai-report.ts) 각도가 나쁘면
// 리포트 품질이 그대로 무너진다. 영상당 리포트는 한 번만 만들어져 다시 못 뽑으므로
// 분석 전에, 그리고 촬영 화면에서 미리 이 시트로 찍는 법을 알려준다.
export const AiGuideSheet = forwardRef<BottomSheetModal, AiGuideSheetProps>(
  ({ onStart }, ref) => {
    const themeColor = useCurrentThemeColor();
    const t = useT();
    // 사진은 본문 폭을 꽉 채우되 원본 9:16을 지켜야 한다 — flex+고정높이로 두면
    // 폰 폭마다 비율이 달라져 cover가 사람을 잘라낸다. 폭에서 높이를 만든다.
    // (높이를 10pt 덜 주는 건 시트 안에 한 화면으로 담기 위한 여유다. 잘려나가는
    //  건 위아래 프레임 여백 5pt씩뿐이다.)
    const { width } = useWindowDimensions();
    const illustWidth = (width - CONTENT_PADDING * 2 - ILLUST_GAP) / 2;
    const illustHeight = Math.round((illustWidth * 16) / 9) - 10;
    const snapPoints = useMemo(() => ["90%"], []);
    // 읽기 전용일 때 버튼으로 스스로 닫아야 해서 안쪽 ref를 따로 들고 넘겨준다.
    // (ref 콜백은 레이아웃 이펙트보다 먼저 붙으므로 여기서 current는 이미 채워져 있다)
    const innerRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => innerRef.current as BottomSheetModal, []);

    // 메모 시트와 달리 뒤 영상을 볼 이유가 없다 — 읽는 동안은 덮는다
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    // BottomSheet(비모달)는 마운트된 화면 안에만 그려져 탭바·헤더 뒤로 들어간다.
    // Modal은 _layout.tsx의 BottomSheetModalProvider로 포털돼 그 위에 뜬다.
    return (
      <BottomSheetModal
        ref={innerRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: themeColor.background }}
        handleIndicatorStyle={{ backgroundColor: themeColor.subText }}
      >
        {/* flex:1이 없으면 내용 높이 그대로 자라서 버튼이 시트 밖으로 밀린다 */}
        <View style={styles.sheet}>
          {/* 작은 기기나 동의 문구가 붙는 분석 모드에서는 내용이 시트보다 길어
              스크롤이 생긴다. 제목까지 같이 밀려 올라가면 무슨 화면인지 알 수
              없으므로 제목만 스크롤 밖에 고정한다. */}
          <Text style={[styles.title, styles.header]}>
            {t("ai.guideTitle")}
          </Text>
          {/* 스크롤 막대를 숨기지 않는다 — 동의 문구가 붙는 분석 모드에서는 마지막
              항목이 접히는데, 막대가 없으면 더 있는 줄 모르고 그냥 누른다 */}
          <BottomSheetScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.lead, { color: themeColor.subText }]}>
              {t("ai.guideLead")}
            </Text>
            {/* 어두운 판 위에 올리는 사진이라 다크·라이트 공용이다.
                스쿼트·데드리프트 두 장으로 "45도"가 뭘 뜻하는지 바로 보여준다. */}
            <View style={styles.illustRow}>
              <Image
                source={require("@/assets/images/ai-guide-squat.jpg")}
                style={[
                  styles.illust,
                  { width: illustWidth, height: illustHeight },
                ]}
                contentFit="cover"
              />
              <Image
                source={require("@/assets/images/ai-guide-deadlift.jpg")}
                style={[
                  styles.illust,
                  { width: illustWidth, height: illustHeight },
                ]}
                contentFit="cover"
              />
            </View>
            {GUIDE_KEYS.map((key) => (
              <View key={key} style={styles.item}>
                {/* 첫 줄 글자 높이 한가운데에 맞춘다 — center로 두면 문단 중앙으로 내려간다 */}
                <View
                  style={[styles.dot, { backgroundColor: themeColor.tint }]}
                />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{t(`ai.guide${key}`)}</Text>
                  <Text
                    style={[styles.itemDesc, { color: themeColor.subText }]}
                  >
                    {t(`ai.guide${key}Desc`)}
                  </Text>
                </View>
              </View>
            ))}
          </BottomSheetScrollView>
          <View style={styles.footer}>
            {/* 동의는 분석을 시작하는 쪽에서만 받는다. 스크롤 영역에 두면 아래로
                밀려 안 보인 채 버튼을 누르게 되므로 버튼과 같은 푸터에 고정한다. */}
            {onStart ? (
              <Text style={[styles.consent, { color: themeColor.subText }]}>
                {t("ai.consentDesc")}
              </Text>
            ) : null}
            <Button
              type="solid"
              // Button solid는 marginHorizontal 20이 기본이라 footer 패딩과 겹쳐
              // 본문보다 두 배로 들어간다 — 여기서 지워 본문과 같은 20으로 맞춘다
              style={{ backgroundColor: themeColor.tint, marginHorizontal: 0 }}
              onPress={() =>
                onStart ? onStart() : innerRef.current?.dismiss()
              }
            >
              {onStart ? t("ai.consentAction") : t("ai.guideGotIt")}
            </Button>
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

AiGuideSheet.displayName = "AiGuideSheet";

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  content: {
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  header: {
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 4,
    paddingBottom: 8,
  },
  lead: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
  illustRow: {
    flexDirection: "row",
    gap: ILLUST_GAP,
  },
  // 크기는 폰 폭에서 계산해 인라인으로 얹는다
  illust: {
    backgroundColor: "#0D0D0D",
  },
  item: {
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
  },
  itemDesc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
  consent: {
    fontFamily: "sb-l",
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
});
