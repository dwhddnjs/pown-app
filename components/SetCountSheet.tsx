import { StyleSheet, Text, View } from "react-native"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import Colors from "@/constants/Colors"

interface SetCountSheetProps {
  sheetRef: any
  onChange: (index: number) => void
}

export const SetCountSheet = forwardRef<BottomSheet, any>((props, ref) => {
  const [selectedLanguage, setSelectedLanguage] = useState()

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
        }}
      >
        <View
          style={{
            width: "50%",
          }}
        >
          <Text style={styles.title}>세트 수</Text>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLanguage(itemValue)
            }
          >
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
            <Picker.Item label="JavaScript" value="js" color="#ffffff" />
          </Picker>
        </View>

        <View
          style={{
            width: "50%",
          }}
        >
          <Text style={styles.title}>횟수</Text>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedLanguage(itemValue)
            }
          >
            <Picker.Item label="Java" value="java" />
            <Picker.Item label="JavaScript" value="js" />
          </Picker>
        </View>
      </View>
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
})
