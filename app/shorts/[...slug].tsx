import { ShortsPlayer } from "@/components/shorts/shorts-player";
import { ShortsMemoSheet } from "@/components/shorts/shorts-memo-sheet";
import { Text, View } from "@/components/themed";
import { ShortsVideoTypes, useShortsStore } from "@/hooks/use-shorts-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowIcon from "@expo/vector-icons/AntDesign";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import Feather from "@expo/vector-icons/Feather";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { format } from "date-fns";
import { formatDate } from "@/lib/date";
import { useLanguage } from "@/hooks/use-user-store";
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { GUIDE_KEYS } from "@/components/shorts/ai-guide-sheet";
import { ScanOverlay } from "@/components/shorts/scan-overlay";
import { useT } from "@/hooks/use-t";
import {
  extractFrames,
  generateReport,
  getLastAiFailure,
  identifyWorkout,
} from "@/lib/ai-report";
import { showRewardedAd } from "@/lib/ads";
import { toast } from "sonner-native";
import { StatusBar } from "expo-status-bar";

// 분석 중인 영상 id. 컴포넌트 state로 두면 화면을 나갔다 다시 들어올 때 초기화돼
// 같은 영상을 두 번 분석한다(쿼터 2회 + 광고 2회 + 리포트 덮어쓰기).
// use-shorts-store의 hasRepaired와 같은 이유로 모듈 스코프에 둔다.
const analyzingIds = new Set<number>();

const KNOB = 12;
const BAR_HEIGHT = 3;

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>();

  const { videos, setReport, setAiConsent } = useShortsStore();
  // 아이패드는 회전하므로 모듈 로드 시점 폭을 고정하면 안 된다
  const { width: screenWidth } = useWindowDimensions();
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const { back, push } = useRouter();
  // 리포트를 열면 이 화면은 뒤에 남아 있어 영상이 계속 돌고 소리까지 난다
  const isFocused = useIsFocused();
  const t = useT();
  const initialPage = useMemo(() => {
    const index = videos.findIndex((v) => v.id === parseInt(slug?.[0]));
    return index >= 0 ? index : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [position, setPosition] = useState(initialPage);
  const [isOpen, setIsOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // 확인 다이얼로그에서 "분석하기"를 누르면 이어서 돌릴 대상
  const [pending, setPending] = useState<{
    id: number;
    durationMs: number;
  } | null>(null);
  // 분석 도중 화면을 떠났으면 리포트는 저장하되 화면을 띄우지는 않는다
  const isMountedRef = useRef(true);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const memoRef = useRef<BottomSheet>(null);

  // 영상 한 페이지의 원래 높이 — JS쪽 페이지 인덱스 계산용
  const [fullHeight, setFullHeight] = useState(0);
  // 메모 시트의 상단 Y. 시트가 스프링·손가락으로 움직이는 매 프레임이 그대로 영상 높이가 된다.
  // (닫혀 있으면 컨테이너 높이라서 영상 높이보다 크다 → clamp 되어 원래 높이)
  const sheetTop = useSharedValue(0);
  const fullHeightSV = useSharedValue(0);
  // 재생 중인 영상의 진행률 — 손잡이(점)를 여기서 그린다
  const progressSV = useSharedValue(0);
  // 스크롤 중에는 진행바·손잡이를 숨긴다
  const barOpacity = useSharedValue(1);

  const pageHeight = useDerivedValue(() =>
    fullHeightSV.value === 0 || sheetTop.value <= 0
      ? fullHeightSV.value
      : Math.min(sheetTop.value, fullHeightSV.value),
  );

  // 페이지 높이는 절대 변하지 않는다. 예전엔 시트에 맞춰 페이지와 스크롤뷰 높이를
  // 같이 줄였는데, iOS는 contentSize·bounds가 바뀌는 프레임에 contentOffset을
  // (contentSize - bounds)로 잘라낸다 — 둘이 같은 프레임에 반영되지 않는 순간
  // 최대 오프셋이 거의 0이 되어 보고 있던 페이지가 첫 페이지로 잘려버렸다.
  // (시트가 멈추면 높이가 더 안 바뀌어 UI 스레드 보정도 다시 돌지 않으니 그대로 남는다.)
  // 이제 줄어드는 건 페이지 "안쪽 영상 영역"뿐이라 스크롤 기하가 흔들리지 않는다.
  const videoAreaStyle = useAnimatedStyle(() => ({
    height: pageHeight.value,
  }));

  // 영상이 줄어든 상태인지는 시트 콜백이 아니라 실제 높이에서 판단한다.
  // onAnimate(-1)만 믿으면 키보드 때문에 닫기가 취소됐을 때 상태가 어긋나
  // 시트는 열려 있는데 contentFit이 cover로 돌아가 영상이 확대돼 보인다.
  const onMemoOpenChange = useCallback((isMemoOpen: boolean) => {
    setIsMemoOpen(isMemoOpen);
    // 저장 버튼으로 닫으면 키보드만 화면에 남는다
    if (!isMemoOpen) {
      Keyboard.dismiss();
    }
  }, []);

  useAnimatedReaction(
    () => fullHeightSV.value > 0 && pageHeight.value < fullHeightSV.value - 1,
    (isShrunk, prev) => {
      if (isShrunk !== prev) {
        runOnJS(onMemoOpenChange)(isShrunk);
      }
    },
  );

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  // 개발 빌드에서는 실패 원인(HTTP 429 / timeout / network …)을 토스트에 붙인다.
  // no-console 규칙 때문에 로그가 없어 원인을 두 번이나 추측으로 좁혔다.
  const failMessage = useCallback(
    () =>
      __DEV__ ? `${t("ai.failed")} [${getLastAiFailure()}]` : t("ai.failed"),
    [t],
  );

  const runAnalyze = useCallback(
    async (video: ShortsVideoTypes, durationMs: number) => {
      analyzingIds.add(video.id);
      setIsAnalyzing(true);
      try {
        const frames = await extractFrames(video.video, durationMs);
        const identified = await identifyWorkout(frames);
        if (identified.status === "failed") {
          return toast.error(failMessage());
        }
        if (identified.status === "notWorkout") {
          return toast.error(t("ai.notWorkout"));
        }
        // 종목을 확정하지 못했으면 여기서 끊는다. 광고를 띄우기 전이고 setReport도
        // 부르지 않으므로 영상당 한 번뿐인 리포트 기회가 그대로 남는다 — 엉뚱한 종목의
        // 자세 교정이 영구 저장되는 것보다 다시 찍어달라고 하는 편이 낫다.
        if (identified.status === "unknown") {
          return toast.error(t("ai.unknownWorkout"));
        }
        // 리포트를 쓰는 동안 광고를 보여주고 둘을 같이 기다린다.
        // 광고가 먼저 끝나면 스캔 화면이 잠깐 더 돌 뿐이다.
        const [report] = await Promise.all([
          generateReport(frames, identified.exercise),
          showRewardedAd(),
        ]);
        if (!report) {
          return toast.error(failMessage());
        }
        setReport(video.id, report);
        if (isMountedRef.current) {
          push(`/shorts/report/${video.id}`);
        }
      } catch {
        // Gemini 호출은 스스로 삼키지만 setReport(MMKV 쓰기)·push는 던질 수 있다.
        // 여기서 안 잡으면 finally가 스캔 화면만 걷어내서, 광고까지 본 사용자가
        // 아무 안내 없이 영상으로 돌아온다(프로덕션은 조용한 unhandled rejection).
        toast.error(failMessage());
      } finally {
        analyzingIds.delete(video.id);
        setIsAnalyzing(false);
      }
    },
    [push, setReport, t, failMessage],
  );

  // 리포트는 영상당 한 번만 만든다 — 이미 있으면 같은 버튼이 "보기"가 된다
  const onAnalyze = useCallback(
    (videoId: number, durationMs: number) => {
      // position은 onMomentumScrollEnd에서만 갱신된다 — 페이지 전환 애니메이션 중에는
      // 버튼을 누른 영상과 videos[position]이 서로 다른 항목을 가리킨다
      const video = videos.find((item) => item.id === videoId);
      if (!video || analyzingIds.has(videoId)) {
        return;
      }
      // E. duration을 못 읽은 채 진행하면 앞 4초만 샘플링한 리포트가 영구 저장된다
      // (영상당 1회 정책이라 다시 만들 수 없다) — 실패로 끊는 편이 낫다
      if (durationMs <= 0 && !video.report) {
        return toast.error(failMessage());
      }
      if (video.report) {
        return push(`/shorts/report/${video.id}`);
      }
      // 찍고 나서야 각도를 바꿀 수 없으니, 가이드를 다시 보여주는 대신
      // 조건을 지켰는지 확인만 받는다 (촬영 가이드는 촬영 화면·숏츠 탭에 있다)
      setPending({ id: video.id, durationMs });
    },
    [videos, push, failMessage],
  );

  // 조건은 이 다이얼로그에서 제일 중요한 내용이라 설명 문단에 섞지 않고 박스로 띄운다.
  // 문구는 가이드 시트와 같은 키를 돌려 쓴다 — 따로 적으면 서로 어긋난다.
  const checkList = useMemo(
    () => (
      <View
        style={[styles.checkBox, { backgroundColor: themeColor.background }]}
      >
        {GUIDE_KEYS.map((key) => (
          <View key={key} style={styles.checkRow}>
            <View
              style={[styles.checkDot, { backgroundColor: themeColor.tint }]}
            />
            <Text style={styles.checkText}>{t(`ai.guide${key}`)}</Text>
          </View>
        ))}
        {/* 경고색(#F13C33)은 양 테마에서 대비가 4:1이 안 된다(AA 미달) —
            읽기보다 눈에 띄는 쪽을 택한 의도된 선택이다 */}
        <View style={styles.warnRow}>
          <Feather
            name="alert-triangle"
            size={14}
            color={themeColor.fail}
            style={styles.warnIcon}
          />
          <Text style={[styles.warnText, { color: themeColor.fail }]}>
            {t("ai.checkWarn")}
          </Text>
        </View>
      </View>
    ),
    [t, themeColor.background, themeColor.tint, themeColor.fail],
  );

  // 진행바 손잡이는 스크롤뷰 밖에서 그린다 —
  // 막대 중앙에 맞추면 아래 절반이 스크롤뷰 밖이라 안에서는 잘린다
  const knobStyle = useAnimatedStyle(() => ({
    top: pageHeight.value - BAR_HEIGHT / 2 - KNOB / 2,
    left: Math.min(
      Math.max(progressSV.value * screenWidth - KNOB / 2, 0),
      screenWidth - KNOB,
    ),
    opacity: pageHeight.value > 0 ? barOpacity.value : 0,
  }));

  // 첫 진입 시 슬러그가 가리키는 페이지로 한 번 맞춘다 — 자식 레이아웃이 잡힌 뒤라야
  // offset이 0으로 clamp되지 않는다
  useEffect(() => {
    if (!fullHeight) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: position * fullHeight,
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullHeight]);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: themeColor.hard }}
    >
      <StatusBar style="light" />
      {/* 페이지 한 장의 높이를 재는 래퍼 — 시트가 올라와도 이 높이는 변하지 않는다 */}
      <Animated.View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const layoutHeight = e.nativeEvent.layout.height;
          fullHeightSV.value = layoutHeight;
          setFullHeight(layoutHeight);
        }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          pagingEnabled
          horizontal={false}
          scrollEnabled={!isMemoOpen && !isAnalyzing}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "black" }}
          // 다른 영상을 보려고 스크롤을 시작하면 진행바·손잡이를 감춘다
          onScrollBeginDrag={() => {
            barOpacity.value = withTiming(0, { duration: 120 });
          }}
          // onScroll을 쓰면 높이가 바뀔 때도 이벤트가 와서 옛 offset ÷ 새 height로
          // 엉뚱한 페이지가 계산된다. 사용자 스와이프가 끝났을 때만 갱신한다.
          onMomentumScrollEnd={(e) => {
            barOpacity.value = withTiming(1, { duration: 180 });
            if (!fullHeight) {
              return;
            }
            const offsetY = e.nativeEvent.contentOffset.y;
            const index = Math.min(
              Math.max(Math.round(offsetY / fullHeight), 0),
              videos.length - 1,
            );
            if (index !== position) {
              setPosition(index);
            }
          }}
        >
          {videos.map((item, index) => {
            return (
              <View
                key={item.id}
                style={{
                  width: "100%",
                  height: fullHeight,
                  backgroundColor: "transparent",
                }}
              >
                {/* 시트가 덮는 만큼 영상 영역만 줄인다 — 페이지 높이는 그대로다 */}
                <Animated.View style={videoAreaStyle}>
                  <ShortsPlayer
                    uri={item.video}
                    isActive={index === position && isFocused}
                    compact={isMemoOpen}
                    progressSV={progressSV}
                    barOpacity={barOpacity}
                    onPressMemo={() => memoRef.current?.snapToIndex(0)}
                    onPressAnalyze={(durationMs) =>
                      onAnalyze(item.id, durationMs)
                    }
                    analyzeLabel={t("ai.analyze")}
                    hasReport={!!item.report}
                  />
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>
        {isAnalyzing && (
          <ScanOverlay label={t("ai.scanning")} longLabel={t("ai.writing")} />
        )}
      </Animated.View>
      <View
        style={[
          styles.backButtonContainer,
          { backgroundColor: themeColor.hard },
        ]}
      >
        <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => back()}>
          <ArrowIcon name="left" size={24} color={themeColor.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16 }}>
          {videos[position]?.createdAt
            ? formatDate(
                format(new Date(videos[position].createdAt), "yyyy.MM.dd"),
                lang,
              )
            : ""}
        </Text>
        <TouchableOpacity
          style={{ paddingRight: 16 }}
          disabled={isAnalyzing}
          onPress={() => setIsOpen(true)}
        >
          {/* 분석 중 삭제하면 진행 중인 프레임 추출 밑에서 파일이 사라진다 */}
          <Feather
            name="trash"
            size={24}
            color={isAnalyzing ? themeColor.subText : themeColor.text}
          />
        </TouchableOpacity>
      </View>
      <ConfirmDialog
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title={t("ai.checkTitle")}
        content={checkList}
        footer={
          <Text style={[styles.consentText, { color: themeColor.subText }]}>
            {t("ai.consentDesc")}
          </Text>
        }
        actionLabel={t("ai.consentAction")}
        actionColor={themeColor.tint}
        onConfirm={() => {
          const target = pending;
          setPending(null);
          if (!target) {
            return;
          }
          setAiConsent();
          const video = videos.find((item) => item.id === target.id);
          if (video) {
            runAnalyze(video, target.durationMs);
          }
        }}
      />
      <RemoveShortsDialog
        open={isOpen}
        setIsOpen={() => setIsOpen(false)}
        position={position}
      />
      <ShortsMemoSheet
        ref={memoRef}
        video={videos[position]}
        animatedPosition={sheetTop}
      />
      {/* 하단바·시트보다 뒤에 그려서 경계선 위에 그대로 겹치게 둔다 */}
      <Animated.View
        pointerEvents="none"
        style={[styles.knob, { backgroundColor: themeColor.tint }, knobStyle]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  checkBox: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  checkRow: {
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 10,
  },
  // 첫 줄 글자 높이 한가운데에 맞춘다 — alignItems: center로 두면 조건이 두 줄로
  // 접히는 순간 점이 문단 중앙으로 내려간다
  checkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 7,
  },
  // sb-m + 기본 텍스트색 — 회색 sb-l인 설명과 확실히 갈린다
  checkText: {
    flex: 1,
    fontSize: 14,
  },
  warnRow: {
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  // 첫 줄 글자 높이 한가운데에 맞춘다
  warnIcon: {
    marginTop: 2,
  },
  warnText: {
    flex: 1,
    fontFamily: "sb-l",
    fontSize: 12,
    lineHeight: 18,
  },
  // 가이드 시트의 같은 고지와 크기를 맞춘다
  consentText: {
    fontFamily: "sb-l",
    fontSize: 12,
    lineHeight: 18,
  },
  knob: {
    position: "absolute",
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
  backButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
