import React from "react";
// component
import { StyleSheet, TouchableOpacity, View as RNView } from "react-native";
// lib
import { ThemeColorType } from "@/constants/colors";

// 깃허브 잔디와 같은 5단계 — 0(없음)은 empty 배경이라 여기 없고, 1~4단계만.
// 하루 4개 이상은 모두 최고 단계.
const LEVEL_OPACITY = [0.3, 0.5, 0.75, 1] as const;

// 열=주, 행=요일 (깃허브와 동일). 메인이 아닌 보조 카드라 셀은 작게 잡고 가로 스크롤.
export const CELL = 10;
export const GAP = 3;
export const COL = CELL + GAP;

// 월 라벨 줄의 높이 = 라벨 line box(11) + 그리드와 띄우는 여백(4).
// 라벨은 이 영역 안에 absolute로 얹히므로 이 값이 곧 그리드의 paddingTop이다.
export const MONTH_LABEL_H = 15;
export const MONTH_LABEL_LINE = 11;

const levelOf = (count: number) => (count > 4 ? 4 : count);

export const cellColor = (count: number, themeColor: ThemeColorType) =>
  count === 0
    ? { backgroundColor: themeColor.empty }
    : {
        backgroundColor: themeColor.tint,
        opacity: LEVEL_OPACITY[levelOf(count) - 1],
      };

// left는 툴팁 상자의 x — 셀 중앙에 걸치되 가로 스크롤 뷰포트 밖으로 나가면 잘리므로
// 탭 시점에 뷰포트 안으로 가둬서 담아둔다.
export type SelectedCell = {
  key: string;
  count: number;
  x: number;
  y: number;
  left: number;
};

type GrassCellProps = {
  dateKey: string;
  count: number;
  themeColor: ThemeColorType;
  // 해당 연도 밖의 날짜와 미래는 자리만 차지하고 그리지 않는다 (깃허브와 동일)
  hidden: boolean;
  onPress: (cell: Omit<SelectedCell, "left">) => void;
  x: number;
  y: number;
};

// 셀이 371개라 memo가 없으면 툴팁을 한 번 열고 닫을 때마다 전부 리렌더된다
export const GrassCell = React.memo(
  ({ dateKey, count, themeColor, hidden, onPress, x, y }: GrassCellProps) => {
    if (hidden) {
      return <RNView style={styles.cell} />;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        // 10pt 셀은 손가락으로 겨냥하기 어렵다 — 탭 영역만 사방 4pt 넓힌다.
        // 이웃과 겹치는 만큼 가장자리는 옆 날짜가 잡힐 수 있지만 아예 안 눌리는 편보다 낫다.
        hitSlop={4}
        onPress={() => onPress({ key: dateKey, count, x, y })}
        style={styles.cell}
      >
        {/* 단계 불투명도는 안쪽에 준다 — 터치 피드백(activeOpacity)은 절대값이라
            바깥에 같이 주면 옅은 셀이 눌렀을 때 오히려 밝아진다 */}
        <RNView style={[styles.cellFill, cellColor(count, themeColor)]} />
      </TouchableOpacity>
    );
  },
);
GrassCell.displayName = "GrassCell";

const styles = StyleSheet.create({
  cell: {
    width: CELL,
    height: CELL,
  },
  cellFill: {
    flex: 1,
    borderRadius: 2,
  },
});
