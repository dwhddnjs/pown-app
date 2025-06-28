import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { Dialog } from "../Dialog"
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Button } from "../Button"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useState } from "react"
import { format } from "date-fns"

interface SelectTypeDateSheetProps {
  isOpen: boolean
  onClose: () => void
}

export const SelectTypeDateSheet = () => {
  const { open, setOpen } = useIsDialogOpenStore()
  const { setDate } = usePlanStore()
  const themeColor = useCurrneThemeColor()
  const [selectedDate, setSelectedDate] = useState(new Date().valueOf())

  const onSubmitDate = () => {
    setOpen(false)
    setDate(new Date(selectedDate))
  }

  return (
    <Dialog isOpen={open} onClose={() => setOpen(false)} modalHeight={110}>
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
          📆 날짜를 선택해주세요.
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
        선택하기
      </Button>
    </Dialog>
  )
}

const styles = StyleSheet.create({
  title: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  datePicker: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 12,
  },
})
