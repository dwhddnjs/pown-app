import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { FontAwesome } from "@expo/vector-icons"
import { sortWorkoutPlanList } from "@/lib/function"
import { usePlanStore } from "@/hooks/use-plan-store"

interface SearchWorkoutTagSheetProps {
  onClose: () => void
  workoutList: string[]
}

export const SearchWorkoutTagSheet = forwardRef<
  BottomSheet,
  SearchWorkoutTagSheetProps
>(({ onClose, workoutList }, ref) => {
  const themeColor = useCurrneThemeColor()
  const { workout, setPlanValue } = usePlanStore()
  const [input, setInput] = useState("")

  const snapPoints = useMemo(() => ["80%"], [])

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
  const onPressWorkout = (item: string) => {
    if (workout === item) {
      setPlanValue("workout", "")
      return
    }
    setPlanValue("workout", item)
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: themeColor.itemColor,
      }}
      handleIndicatorStyle={{
        backgroundColor: themeColor.subText,
      }}
    >
      <View style={{ paddingTop: 12, gap: 12 }}>
        <View
          style={[
            styles.searchIconContainer,
            {
              borderColor: themeColor.subText,
            },
          ]}
        >
          <View
            style={[
              styles.searchIcon,
              {
                backgroundColor: themeColor.tint,
              },
            ]}
          >
            <FontAwesome name="search" size={20} color={themeColor.text} />
          </View>
          <TextInput
            placeholder="찾으시는 운동계획이 있으신가요?"
            style={{ color: themeColor.text }}
          />
        </View>
        <View style={styles.container}>
          {workoutList?.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.tag,
                { borderColor: themeColor.tint },
                item === workout && {
                  backgroundColor: themeColor.tint,
                },
              ]}
              onPress={() => onPressWorkout(item)}
            >
              <Text
                style={[
                  styles.title,
                  { color: themeColor.tint },
                  item === workout && {
                    color: themeColor.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 2,

    borderRadius: 50,
  },
  title: {
    fontFamily: "sb-l",
    fontSize: 14,
  },
  searchIconContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 50,
    marginHorizontal: 20,
    padding: 4,
    gap: 12,
  },

  searchIcon: {
    padding: 6,
    width: 40,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
})
