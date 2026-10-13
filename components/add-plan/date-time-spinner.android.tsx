import React from "react";
// component
import { StyleSheet, useColorScheme, View } from "react-native";
import {
  WHEEL_BAND_COLOR,
  WheelColumn,
  WheelMetrics,
} from "@/components/wheel";
// lib
import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";

type DateTimeSpinnerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

// iOS UIDatePicker(스피너, 한국어)를 시뮬레이터에서 잰 값 (pt) — 반지름 84 원통, 한 행 호 33(= 선택 띠)
const METRICS: WheelMetrics = {
  height: 216,
  row: 33,
  radius: 84,
  opacity: {
    light: [0.92, 0.42, 0.38, 0.23, 0.11],
    dark: [0.71, 0.35, 0.33, 0.19, 0.09],
  },
};
// 열 자리 — 선택 띠(폭 310) 왼쪽 끝에서 9.5 바깥이 0. 날짜는 오른쪽 정렬, 나머지는 가운데
const WIDTH = 329;
const DATE_RIGHT = 149;
const COLUMN = 50;
const AMPM_CENTER = 179;
const HOUR_CENTER = 235;
const MINUTE_CENTER = 289;
// iOS는 "오늘"만 다른 날짜보다 11 안쪽에서 끝난다
const TODAY_INSET = 11;

// 날짜 범위 — 3년 전부터 1년 뒤까지 (iOS는 사실상 무한이지만 운동 기록엔 이 정도면 된다)
const PAST_DAYS = 365 * 3;
const FUTURE_DAYS = 365;
// 시·분은 iOS처럼 끝없이 도는 것처럼 보이게 같은 값을 여러 번 이어 붙이고 가운데서 시작한다.
// 값이 정해질 때마다 가운데 묶음으로 돌아가서(같은 글자라 티가 안 난다) 끝에 닿지 않는다
const LOOPS = 100;

const pad = (n: number) => String(n).padStart(2, "0");

// 날짜·시간을 한 번에 고르는 스피너 — 안드로이드엔 iOS처럼 한 화면에서 고르는 피커가 없어
// (시스템 날짜→시간 다이얼로그 두 번) iOS 스피너를 JS 휠로 그린다. 표기는 iOS와 같이 한국어
export const DateTimeSpinner = ({ value, onChange }: DateTimeSpinnerProps) => {
  const bandColor = WHEEL_BAND_COLOR[useColorScheme() ?? "light"];
  const today = startOfDay(new Date());
  const dayIndex = PAST_DAYS + differenceInCalendarDays(value, today);
  const hours = value.getHours();
  const pm = hours >= 12 ? 1 : 0;
  const hour12 = hours % 12;
  const minute = value.getMinutes();

  const update = (day: number, ampm: number, hour: number, min: number) => {
    const next = addDays(today, day - PAST_DAYS);
    next.setHours(ampm * 12 + hour, min, 0, 0);
    onChange(next);
  };

  return (
    <View style={styles.wheel}>
      <View style={[styles.band, { backgroundColor: bandColor }]} />
      <WheelColumn
        metrics={METRICS}
        count={PAST_DAYS + FUTURE_DAYS + 1}
        index={dayIndex}
        label={(i) =>
          i === PAST_DAYS
            ? "오늘"
            : format(addDays(today, i - PAST_DAYS), "M월 d일 E", { locale: ko })
        }
        rowTextStyle={(i) => (i === PAST_DAYS ? styles.today : undefined)}
        onChange={(i) => update(i, pm, hour12, minute)}
        textStyle={[styles.label, styles.right]}
        style={styles.dateColumn}
      />
      <WheelColumn
        metrics={METRICS}
        count={2}
        index={pm}
        label={(i) => (i === 0 ? "오전" : "오후")}
        onChange={(i) => update(dayIndex, i, hour12, minute)}
        textStyle={styles.label}
        style={[styles.column, { left: AMPM_CENTER - COLUMN / 2 }]}
      />
      <WheelColumn
        metrics={METRICS}
        count={12 * LOOPS}
        index={12 * (LOOPS / 2) + hour12}
        // 12시는 0으로 들고 있다 (오전 12시 = 0시)
        label={(i) => String(i % 12 === 0 ? 12 : i % 12)}
        onChange={(i) => update(dayIndex, pm, i % 12, minute)}
        textStyle={[styles.label, styles.digits]}
        style={[styles.column, { left: HOUR_CENTER - COLUMN / 2 }]}
      />
      <WheelColumn
        metrics={METRICS}
        count={60 * LOOPS}
        index={60 * (LOOPS / 2) + minute}
        label={(i) => pad(i % 60)}
        onChange={(i) => update(dayIndex, pm, hour12, i % 60)}
        textStyle={[styles.label, styles.digits]}
        style={[styles.column, { left: MINUTE_CENTER - COLUMN / 2 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wheel: {
    width: WIDTH,
    height: METRICS.height,
  },
  band: {
    position: "absolute",
    top: (METRICS.height - METRICS.row) / 2,
    height: METRICS.row,
    left: 9.5,
    right: 9.5,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  dateColumn: {
    position: "absolute",
    left: 0,
    width: DATE_RIGHT,
  },
  column: {
    position: "absolute",
    width: COLUMN,
  },
  // iOS는 23.5pt 시스템 글꼴(SF) — 안드로이드 시스템 글꼴(Noto CJK)은 한글이 10% 커서 줄인다.
  // 숫자(Roboto)는 크기가 같아 시·분은 iOS 크기 그대로
  label: {
    fontSize: 22,
    textAlign: "center",
  },
  digits: {
    fontSize: 23.5,
  },
  right: {
    textAlign: "right",
  },
  today: {
    paddingRight: TODAY_INSET,
  },
});
