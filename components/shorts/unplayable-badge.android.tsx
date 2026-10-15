import { StyleSheet, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";

// iOS 네이티브 플레이어가 재생 못 하는 영상(파일 깨짐) 가운데에 띄우는 play.slash 표시를 그린다 —
// 안드로이드 플레이어는 검은 화면만 남는다. 시뮬레이터에서 잰 모양·크기(46 × 38, 시스템 회색)
const GRAY = "#8E8E93";

export const UnplayableBadge = ({ visible }: { visible: boolean }) =>
  visible ? (
    <View pointerEvents="none" style={styles.badge}>
      <Svg width={46} height={38} viewBox="0 0 46 38">
        <Path
          d="M10.5 2.5 Q10.5 0.5 12.3 1.5 L42 17.4 Q43.7 18.4 42 19.4 L12.3 36 Q10.5 37 10.5 35 Z"
          fill={GRAY}
        />
        {/* 사선 위아래 틈 — 영상 영역 바탕(검정)으로 삼각형을 끊는다 */}
        <Line
          x1={3.6}
          y1={0.6}
          x2={45.4}
          y2={25.2}
          stroke="black"
          strokeWidth={2}
        />
        <Line
          x1={0.6}
          y1={5.8}
          x2={42.4}
          y2={30.4}
          stroke="black"
          strokeWidth={2}
        />
        <Line
          x1={2.1}
          y1={3.2}
          x2={43.9}
          y2={27.8}
          stroke={GRAY}
          strokeWidth={4.2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  ) : null;

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
  },
});
