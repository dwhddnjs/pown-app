import { StyleSheet } from "react-native"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import Colors from "@/constants/Colors"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Text, View } from "./Themed"
import { Button } from "./Button"

interface SetCountSheetProps {
  sheetRef: any
  onChange: (index: number) => void
}

export const SetCountSheet = forwardRef<BottomSheet, any>((props, ref) => {
  const [selectedLanguage, setSelectedLanguage] = useState()
  const set = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  const count = [
    "1 + α",
    "2 + α",
    "3 + α",
    "4 + α",
    "5 + α",
    "6 + α",
    "7 + α",
    "8 + α",
    "9 + α",
    "10 + α",
    "11 + α",
    "12 + α",
    "13 + α",
    "14 + α",
    "15 + α",
  ]

  const snapPoints = useMemo(() => ["50%"], [])
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  )

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.dark.itemColor }}
      handleIndicatorStyle={{ backgroundColor: Colors.dark.subText }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingTop: 14,
          backgroundColor: Colors.dark.itemColor,
        }}
      >
        <View
          style={{
            width: "50%",
            backgroundColor: Colors.dark.itemColor,
          }}
        >
          <Text style={styles.title}>세트 수</Text>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLanguage(itemValue)
            }
          >
            {set.map((item) => (
              <Picker.Item
                key={item}
                label={item}
                value={item}
                color={Colors.dark.text}
                fontFamily="sb-b"
              />
            ))}
          </Picker>
        </View>

        <View
          style={{
            width: "50%",
            backgroundColor: Colors.dark.itemColor,
          }}
        >
          <Text style={styles.title}>횟수</Text>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLanguage(itemValue)
            }
          >
            {count.map((item) => (
              <Picker.Item
                key={item}
                label={item}
                value={item}
                color={Colors.dark.text}
                fontFamily="sb-b"
              />
            ))}
          </Picker>
        </View>
      </View>
      <Button type="solid">완료</Button>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
    color: Colors.dark.text,
  },
  successButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 44,
    borderRadius: 12,
  },
})
