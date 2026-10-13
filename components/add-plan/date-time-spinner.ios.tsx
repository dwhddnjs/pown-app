import React from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";

type DateTimeSpinnerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

// 날짜·시간을 한 번에 고르는 스피너 — iOS UIDatePicker.
// 안드로이드는 같은 모양을 JS 휠로 그린다 (date-time-spinner.android.tsx)
export const DateTimeSpinner = ({ value, onChange }: DateTimeSpinnerProps) => (
  <RNDateTimePicker
    mode="datetime"
    display="spinner"
    locale="ko"
    value={value}
    // dismissed 이벤트에는 timestamp가 없다 — 그대로 넣으면 Invalid Date가
    // 저장까지 흘러가 format()이 던진다
    onChange={(e) => {
      const timestamp = e.nativeEvent.timestamp;
      if (timestamp) onChange(new Date(timestamp));
    }}
  />
);
