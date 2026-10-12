import { useEffect } from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
// zustand
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store";
import { usePlanStore } from "@/hooks/use-plan-store";

// 운동 날짜·시간 선택. 안드로이드엔 iOS처럼 날짜와 시간을 한 화면에서 고르는 피커가 없고,
// 피커 컴포넌트는 마운트하는 순간 시스템 다이얼로그를 띄운다. 그래서 그리는 건 없고
// 열림 신호가 오면 날짜 → 시간 다이얼로그를 차례로 띄운다. 도중에 취소하면 날짜는 그대로다
export const SelectTypeDateSheet = () => {
  const open = useIsDialogOpenStore((state) => state.open);
  const setOpen = useIsDialogOpenStore((state) => state.setOpen);

  useEffect(() => {
    if (!open) return;
    // 다이얼로그는 시스템이 띄우니 신호는 바로 내린다 — 그래야 다음에 또 열린다
    setOpen(false);
    const { date, setDate } = usePlanStore.getState();
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      onChange: (dateEvent, pickedDate) => {
        if (dateEvent.type !== "set" || !pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: "time",
          onChange: (timeEvent, pickedTime) => {
            if (timeEvent.type === "set" && pickedTime) setDate(pickedTime);
          },
        });
      },
    });
  }, [open, setOpen]);

  return null;
};
