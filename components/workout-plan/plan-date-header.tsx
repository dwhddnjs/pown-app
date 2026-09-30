import React, { useMemo } from "react";
// component
import { View as RNView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/themed";
import { Stat } from "@/components/heart-rate/heart-rate-row";
import { RoundedSide } from "@/components/rounded-side";
// zustand
import {
  summarizeDay,
  toMinutes,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
// hooks
import { useT } from "@/hooks/use-t";
// lib
import { formatDate } from "@/lib/date";
import { ThemeColorType } from "@/constants/colors";
import { Lang } from "@/lib/i18n";
// expo
import { useRouter } from "expo-router";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";

// 기록 목록 카드의 날짜 헤더. 운동 탭·검색·달력 히스토리가 같은 걸 쓴다 —
// 세 군데에 복사해 두니 검색 화면만 점이 빠지고, 달력 히스토리만 글자색이
// background(라이트에서 밝은 회색)로 갈라져 있었다. 셋 다 onTint로 통일한다.
// 색·언어는 prop으로 받는다 (재활용되는 셀에서 renderItem 의존성이 되어야 한다)
export const PlanDateHeader = ({
  date,
  themeColor,
  lang,
}: {
  date: string;
  themeColor: ThemeColorType;
  lang?: Lang;
}) => {
  // 객체를 돌려주는 셀렉터는 매번 새 참조라 무한 리렌더가 난다 — 배열만 구독한다
  const records = useHeartRateStore((state) => state.records);
  const heart = useMemo(() => summarizeDay(records, date), [records, date]);
  const t = useT();
  const { push } = useRouter();

  return (
    <RNView>
      {/* 카드 위 모서리. 아래 모서리는 그룹 마지막 행(plan-list-row 등)이 RoundedSide로 맡는다 */}
      <RoundedSide side="top">
        <RNView style={[styles.header, { backgroundColor: themeColor.tint }]}>
          <Text
            style={[styles.date, { color: themeColor.onTint }]}
          >{`🗓️  ${formatDate(date, lang)}`}</Text>
          {/* 점은 배경을 뚫은 구멍처럼 보여야 하므로 onTint가 아니라 background */}
          <View
            style={[styles.dot, { backgroundColor: themeColor.background }]}
          />
        </RNView>
      </RoundedSide>
      {/* 심박수 측정 요약 — 헤더 아래 카드 첫 줄. 세 화면 모두 헤더 밑에 itemColor
          카드가 이어지므로 카드의 일부처럼 보인다. 측정 박스와 같은 칸, 중요도 순.
          누르면 세션별 기록(보기·삭제)이 모달로 뜬다 — 달력 히스토리도 모달이라 바텀시트는
          그 밑에 깔린다. 눌린다는 단서는 오른쪽 끝 ›(설정 행과 같은 모양). chevron-up/down은
          이 앱에서 "그 자리에서 펼침·접힘"이라(측정 시작 버튼) 쓰지 않는다 */}
      {heart && (
        <TouchableOpacity
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={t("heartRate.recordsTitle")}
          onPress={() =>
            push({ pathname: "/heart-rate-records", params: { date } })
          }
          style={[styles.summary, { backgroundColor: themeColor.itemColor }]}
        >
          <RNView style={styles.summaryRow}>
            <RNView style={styles.stats}>
              <Stat
                compact
                label={t("heartRate.activeKcal")}
                value={String(heart.activeKcal)}
                unit="kcal"
              />
              <Stat
                compact
                label={t("heartRate.duration")}
                value={t("heartRate.minutes", {
                  n: toMinutes(heart.durationSec),
                })}
              />
              {/* 강도는 평균이 가장 잘 보여준다. 범위는 세션별 기록 화면에 있다.
                평균이 없는 예전 기록만 있는 날은 범위를 대신 둔다 */}
              {heart.avgHR != null ? (
                <Stat
                  compact
                  label={t("heartRate.avg")}
                  value={String(heart.avgHR)}
                  unit="bpm"
                />
              ) : (
                heart.minHR != null &&
                heart.maxHR != null && (
                  <Stat
                    compact
                    label={t("heartRate.range")}
                    // en dash(–)는 sb 폰트에 없어 대체 폰트로 그려진다 — 그 줄만 1.7pt 내려앉고
                    // 띠 높이까지 늘어 아래 여백이 커 보였다. 폰트에 있는 하이픈을 쓴다
                    value={`${heart.minHR}-${heart.maxHR}`}
                    unit="bpm"
                  />
                )
              )}
              <Stat
                compact
                label={t("heartRate.totalKcal")}
                value={String(heart.totalKcal)}
                unit="kcal"
              />
            </RNView>
            <AntDesign name="right" size={15} color={themeColor.subText} />
          </RNView>
          <RNView
            style={[styles.divider, { backgroundColor: themeColor.divider }]}
          />
        </TouchableOpacity>
      )}
    </RNView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 4,
  },
  summary: {
    paddingHorizontal: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    // 위아래를 글자 잉크 기준으로 같게(각 14pt) 맞춘 값이다. 똑같이 12씩 주면 라벨 한글은
    // 줄 박스 위에 붙고 숫자 아래엔 디센더 자리가 남아, 아래가 3.7pt 더 넓어 보였다(@3x 실측)
    paddingTop: 13.67,
    paddingBottom: 10,
    // 구분선은 헤더와 같은 12 안쪽에 두고 칸만 4 더 들인다
    paddingHorizontal: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
