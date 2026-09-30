import React from "react";
// component
import { StyleSheet } from "react-native";
import { View } from "@/components/themed";
import { WorkoutPlan } from "./workout-plan";
import { PlanDateHeader } from "./plan-date-header";
import { YearGrass } from "@/components/grass";
import { AnimatedHeight } from "@/components/animated-height";
import { RoundedSide } from "@/components/rounded-side";
// zustand
import { useHeartRateLiveStore } from "@/hooks/use-heart-rate-store";
// hook
import { Row } from "@/hooks/use-plan-rows";
// lib
import { ThemeColorType } from "@/constants/colors";
import { Lang } from "@/lib/i18n";

// 운동 탭 리스트의 행 2종(날짜 헤더 / 계획 카드)과 리스트 헤더의 잔디.
// 색과 언어는 prop으로 받는다 — 셀이 재사용되므로 renderItem이 이 값들을 의존성으로
// 들고 있어야 테마·언어 변경이 반영된다(workout.tsx의 extraData 참고).

// 측정 중(준비 포함)엔 연간 잔디가 쓸모없다 — 접어서 박스 바로 밑에 오늘 계획이 오게 한다.
// 심박 카드가 펼쳐지는 것과 같은 곡선으로 접혀 한 동작처럼 보인다(그래서 리스트 헤더에 있다)
export const GrassRow = () => {
  const isMeasuring = useHeartRateLiveStore(
    (state) => !!state.live || state.preparingAt !== null,
  );
  return (
    <AnimatedHeight collapsed={isMeasuring}>
      <View style={styles.grass}>
        <YearGrass />
      </View>
    </AnimatedHeight>
  );
};

export const DateHeaderRow = ({
  date,
  themeColor,
  lang,
}: {
  date: string;
  themeColor: ThemeColorType;
  lang: Lang;
}) => (
  <View style={[styles.row, styles.headerRow]}>
    <PlanDateHeader date={date} themeColor={themeColor} lang={lang} />
  </View>
);

export const PlanRow = ({
  item,
  themeColor,
}: {
  item: Extract<Row, { kind: "plan" }>;
  themeColor: ThemeColorType;
}) => {
  // 한 그룹의 첫/마지막 행이 카드의 위아래를 맡는다 (예전엔 그룹 컨테이너가 했다).
  // 위 모서리는 날짜 헤더가, 아래 모서리는 마지막 행이 RoundedSide로 둥글린다
  const isLast = item.index === item.total - 1;

  return (
    <View style={[styles.row, isLast && styles.groupBottomSpace]}>
      <RoundedSide side={isLast ? "bottom" : null}>
        <View
          style={[
            { backgroundColor: themeColor.itemColor },
            item.index === 0 && styles.groupTop,
          ]}
        >
          <WorkoutPlan
            item={item.plan}
            index={item.index}
            totalLength={item.total}
          />
        </View>
      </RoundedSide>
    </View>
  );
};

const styles = StyleSheet.create({
  grass: {
    // 아래 행과 같은 좌우 여백. 날짜 헤더가 paddingTop 24를 가지므로 위만 준다.
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  row: {
    paddingHorizontal: 20,
  },
  // 그룹 사이 간격은 셀 루트의 padding으로 준다 — margin은 셀 프레임 밖이라
  // 가상화 리스트가 재는 행 높이에서 빠질 수 있다
  headerRow: {
    paddingTop: 24,
  },
  groupTop: {
    paddingTop: 2,
  },
  // 그룹 사이 간격 — 날짜 헤더의 paddingTop 24와 합쳐 예전 paddingVertical: 24와 같다
  groupBottomSpace: {
    paddingBottom: 24,
  },
});
