import React, { useState } from "react";
// component
import { View as RNView, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

// iOS 연속 곡률 모서리 하나 — PaintCode가 역산한 iOS 둥근 사각형 곡선 계수(반경 배수).
// [a, b]: a는 들어오는 변을 따라 모서리에서 떨어진 거리, b는 그 변에서 안쪽으로 들어온 거리.
// 곡선은 모서리에서 반경의 K배 떨어진 곳부터 시작한다
const K = 1.52866483;
const CORNER: ["C" | "L", [number, number][]][] = [
  [
    "C",
    [
      [1.08849323, 0],
      [0.86840689, 0],
      [0.66993427, 0.065496],
    ],
  ],
  ["L", [[0.63149399, 0.074911]]],
  [
    "C",
    [
      [0.37282392, 0.16905899],
      [0.16905899, 0.37282392],
      [0.074911, 0.63149399],
    ],
  ],
  ["L", [[0.065496, 0.66993427]]],
  [
    "C",
    [
      [0, 0.86840689],
      [0, 1.08849323],
      [0, K],
    ],
  ],
];

const continuousRectPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) => {
  const r = Math.min(radius, Math.min(w, h) / 2 / K);
  // 시계방향으로 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래 → 왼쪽 위
  const corners = [
    (a: number, b: number) => [x + w - a * r, y + b * r],
    (a: number, b: number) => [x + w - b * r, y + h - a * r],
    (a: number, b: number) => [x + a * r, y + h - b * r],
    (a: number, b: number) => [x + b * r, y + a * r],
  ];
  let d = `M${x + K * r},${y}`;
  for (const at of corners) {
    d += `L${at(K, 0)}`;
    for (const [command, points] of CORNER) {
      d += command + points.map(([a, b]) => at(a, b)).join(" ");
    }
  }
  return `${d}Z`;
};

// 점선 테두리를 연속 곡률로 그린다. RN의 borderStyle: "dashed"는 RN이 원호 경로로 직접
// 그려 borderCurve가 먹지 않는다. 부모의 테두리 대신 자식으로 넣는다 — 부모 크기를 그대로
// 덮는다(레이아웃에 영향 없음). 점선 간격은 RN과 같게 선 = 빈칸 = 굵기 × 3
export const DashedBorder = ({
  color,
  width = 1.5,
  radius = 12,
}: {
  color: string;
  width?: number;
  radius?: number;
}) => {
  const [size, setSize] = useState<{ width: number; height: number }>();
  // 선은 경로 양쪽으로 반씩 퍼진다 — 바깥 가장자리가 부모 경계·반경에 맞게 반만큼 들인다
  const inset = width / 2;

  return (
    <RNView
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      {size && (
        <Svg width={size.width} height={size.height}>
          <Path
            d={continuousRectPath(
              inset,
              inset,
              size.width - width,
              size.height - width,
              radius - inset,
            )}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={[width * 3, width * 3]}
            fill="none"
          />
        </Svg>
      )}
    </RNView>
  );
};
