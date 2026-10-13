import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { Dialog } from "../dialog";
import { DateTimeSpinner } from "./date-time-spinner";
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { Button } from "../button";
import { usePlanStore } from "@/hooks/use-plan-store";
import { EMOJI_LINE_TOP } from "@/constants/text-metrics";
import { useEffect, useState } from "react";

// 운동 날짜·시간 선택 다이얼로그. 스피너는 플랫폼마다 다르다 (date-time-spinner.ios/.android)
export const SelectTypeDateSheet = () => {
  const { open, setOpen } = useIsDialogOpenStore();
  const { date, setDate } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const [selectedDate, setSelectedDate] = useState(date.valueOf());

  // 수정/재선택 시 스피너가 "지금"이 아닌 현재 선택된 날짜에서 시작하도록 동기화
  useEffect(() => {
    if (open) {
      setSelectedDate(date.valueOf());
    }
  }, [open, date]);

  const onSubmitDate = () => {
    setOpen(false);
    setDate(new Date(selectedDate));
  };

  return (
    <Dialog isOpen={open} onClose={() => setOpen(false)} hideOverlay>
      <View
        style={[
          styles.title,
          {
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 18,
            paddingTop: EMOJI_LINE_TOP.dateTitle,
          }}
        >
          {t("plan.selectDate")}
        </Text>
      </View>
      <View
        style={[
          styles.datePicker,
          {
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        <DateTimeSpinner
          value={new Date(selectedDate)}
          onChange={(next) => setSelectedDate(next.valueOf())}
        />
      </View>
      <Button type="solid" onPress={onSubmitDate}>
        {t("common.select")}
      </Button>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  title: {
    // paddingVertical: 12,
    paddingHorizontal: 20,
  },
  datePicker: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 12,
  },
});
