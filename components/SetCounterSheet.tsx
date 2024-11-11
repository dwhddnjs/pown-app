import { StyleSheet, useColorScheme } from "react-native"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import Colors from "@/constants/Colors"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Text, View } from "./Themed"
import { Button } from "./Button"
import { countData, setData, setTypeData } from "@/constants/constants"
import { usePlanStore } from "@/hooks/use-plan-store"

interface SetCountSheetProps {
  onClose: () => void
}

export const SetCounterSheet = forwardRef<BottomSheet, SetCountSheetProps>(
  ({ onClose }, ref) => {
    const [picker, setPicker] = useState({
      set: "본 세트",
      count: "8 + α",
    })
    const { setSetWithCount, setWithCount } = usePlanStore()
    const colorScheme = useColorScheme()

    const onSelectedPicker = (type: string, value: string) => {
      setPicker({
        ...picker,
        [type]: value,
      })
    }

    const onSetPlanStore = () => {
      setSetWithCount({
        ...picker,
        id: setWithCount.length + 1,
        progress: "진행중",
      })
    }

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
        backgroundStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].itemColor,
        }}
        handleIndicatorStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].subText,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            paddingTop: 14,
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
          }}
        >
          <View
            style={{
              width: "50%",
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <Text
              style={[
                styles.title,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
            >
              세트 유형
            </Text>
            <Picker
              selectedValue={picker.set}
              onValueChange={(itemValue, itemIndex) =>
                onSelectedPicker("set", itemValue)
              }
            >
              {setTypeData.map((item) => (
                <Picker.Item
                  key={item}
                  label={String(item)}
                  value={item}
                  color={Colors[colorScheme ?? "light"].text}
                  fontFamily="sb-b"
                />
              ))}
            </Picker>
          </View>

          <View
            style={{
              width: "50%",
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <Text
              style={[
                styles.title,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
            >
              반복 횟수
            </Text>
            <Picker
              selectedValue={picker.count}
              onValueChange={(itemValue, itemIndex) =>
                onSelectedPicker("count", itemValue)
              }
            >
              {countData.map((item) => (
                <Picker.Item
                  key={item}
                  label={item}
                  value={item}
                  color={Colors[colorScheme ?? "light"].text}
                  fontFamily="sb-b"
                />
              ))}
            </Picker>
          </View>
        </View>
        <View
          style={{
            paddingBottom: 44,
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
          }}
        >
          <Button type="solid" onPress={onSetPlanStore}>
            완료
          </Button>
        </View>
      </BottomSheet>
    )
  }
)

const styles = StyleSheet.create({
  container: {},

  title: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
  },
})
