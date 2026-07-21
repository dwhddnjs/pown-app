import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { Dialog } from "../dialog";
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { Button } from "../button";
import { usePlanStore } from "@/hooks/use-plan-store";
import { useEffect, useState } from "react";

interface SelectTypeDateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    <Dialog
      isOpen={open}
      onClose={() => setOpen(false)}
      modalHeight={100}
      hideOverlay
    >
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
        <RNDateTimePicker
          mode="datetime"
          display="spinner"
          locale="ko"
          value={new Date(selectedDate)}
          onChange={(e) => setSelectedDate(e.nativeEvent.timestamp)}
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
