import React from "react";
// component
import { StyleSheet, View as RNView } from "react-native";
import { Text } from "@/components/themed";
// hook
import { useT } from "@/hooks/use-t";
// lib
import { format, parse } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import { ThemeColorType } from "@/constants/colors";
import { Lang } from "@/lib/i18n";
import { CELL, MONTH_LABEL_H, SelectedCell } from "./grass-cell";

// 셀 좌표를 알고 있으므로 measure 없이 절대 배치한다.
// 폭을 재지 않고 가운데 정렬하려고 고정폭 상자를 셀 중앙에 걸쳐 놓고 그 안에서 center 정렬.
export const TOOLTIP_BOX = 160;
// 툴팁 상자 높이(패딩 3*2 + 줄 높이) + 셀과의 간격
const TOOLTIP_OFFSET = 26;

type GrassTooltipProps = {
  cell: SelectedCell;
  themeColor: ThemeColorType;
  lang: Lang;
  t: ReturnType<typeof useT>;
};

export const GrassTooltip = ({
  cell,
  themeColor,
  lang,
  t,
}: GrassTooltipProps) => {
  const date = parse(cell.key, "yyyy.MM.dd", new Date());
  // 위로 띄웠을 때 월 라벨 줄을 덮지 않는 행만 위로 (일·월요일은 아래로)
  const above = cell.y - TOOLTIP_OFFSET >= MONTH_LABEL_H;

  return (
    <RNView
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: cell.left,
          top: above ? cell.y - TOOLTIP_OFFSET : cell.y + CELL + 6,
        },
      ]}
    >
      <RNView style={[styles.tooltip, { backgroundColor: themeColor.tint }]}>
        <Text style={[styles.text, { color: themeColor.onTint }]}>
          {`${format(date, lang === "ko" ? "M월 d일" : "MMM d", {
            locale: lang === "ko" ? ko : enUS,
          })} · ${
            cell.count === 0
              ? t("grass.none")
              : t("grass.plans", { n: cell.count })
          }`}
        </Text>
      </RNView>
    </RNView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    width: TOOLTIP_BOX,
    alignItems: "center",
    zIndex: 10,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontFamily: "sb-l",
    fontSize: 11,
  },
});
