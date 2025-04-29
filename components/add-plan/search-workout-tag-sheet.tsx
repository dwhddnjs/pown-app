import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { FontAwesome } from "@expo/vector-icons"
import { searchByInitial, sortWorkoutPlanList } from "@/lib/function"
import { usePlanStore } from "@/hooks/use-plan-store"

interface SearchWorkoutTagSheetProps {
  onClose: () => void
  workoutList: string[]
  isOpen: boolean
}

export const SearchWorkoutTagSheet = forwardRef<
  BottomSheet,
  SearchWorkoutTagSheetProps
>(({ onClose, workoutList, isOpen }, ref) => {
  console.log("workoutList: ", workoutList)
  const themeColor = useCurrneThemeColor()
  const { workout, setPlanValue } = usePlanStore()
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<TextInput | null>(null)

  const snapPoints = useMemo(() => ["80%"], [])
  const filterWorkoutTag = workoutList?.filter((tag) => {
    const searchLower = inputValue.toLowerCase().trim()
    const nameLower = tag.toLowerCase().trim()

    if (inputValue.length === 1 && /[ㄱ-ㅎ]/.test(inputValue)) {
      return searchByInitial(tag, inputValue)
    }
    return nameLower.includes(searchLower)
  })

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

  useEffect(() => {
    if (inputRef?.current && isOpen) {
      inputRef?.current.focus()
    }
  }, [isOpen, inputRef.current])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onClose={onClose}
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
            <FontAwesome name="search" size={16} color={themeColor.text} />
          </View>
          <TextInput
            ref={inputRef}
            placeholder="찾으시는 운동계획이 있으신가요?"
            style={{ color: themeColor.text }}
            onChangeText={(text) => setInputValue(text)}
            value={inputValue}
          />
        </View>
        <View style={styles.container}>
          {filterWorkoutTag?.map((item) => (
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
          {filterWorkoutTag?.length === 0 && (
            <Text style={{ color: themeColor.subText, fontFamily: "sb-m" }}>
              음.. 찾으시는 운동이 없네요?
            </Text>
          )}
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
