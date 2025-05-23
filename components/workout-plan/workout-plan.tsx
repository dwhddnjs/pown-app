import React, { useCallback, useState } from "react"
// component
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from "react-native"
import { Text, View } from "../Themed"
import { NoteText } from "./note-text"
import { SetListItem } from "./set-list-item"
// icon
import { ConditionIcon } from "../add-plan/condition-icon"
import { WeightDate } from "./weight-date"
import Back from "@/assets/images/svg/back_icon.svg"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
// zustand
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// expo
import { useUserStore } from "@/hooks/use-user-store"
import { useImageUriStore } from "@/hooks/use-image-uri-store"
// import { Image } from "expo-image"

interface WorkoutPlanProps {
  item: WorkoutPlanTypes
  index: number
  totalLength: number
}

export const WorkoutPlan = ({ item, index, totalLength }: WorkoutPlanProps) => {
  const themeColor = useCurrneThemeColor()
  const { mediaLibrary } = useUserStore()
  const { setImageUri } = useImageUriStore()

  const getWorkoutIcon = (type: string) => {
    let result
    switch (type) {
      case "chest":
        result = <Chest />
        break
      case "back":
        result = <Back />
        break
      case "leg":
        result = <Leg />
        break
      case "arm":
        result = <Arm />
        break
      default:
        result = <Shoulder />
        break
    }

    return result
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColor.itemColor },
        index === 0 && { paddingTop: 18 },
        index === totalLength - 1 && { paddingBottom: 18 },
      ]}
    >
      <View
        style={[
          styles.iconLine,
          {
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        {getWorkoutIcon(item.type)}
        {index !== totalLength - 1 && (
          <View
            style={{
              width: 2,
              height: 16,
              flex: 1,
              backgroundColor: themeColor.subText,
            }}
          />
        )}
      </View>
      <View
        style={[
          styles.workoutContainer,
          {
            paddingBottom: 12,
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        <WeightDate
          id={item.id}
          equipment={item.equipment}
          workout={item.workout}
          weight={item.weight}
          date={item.createdAt as string}
          type={item.type}
        />
        {/* 컨디션 */}
        {item.condition.length > 0 && (
          <View
            style={[
              styles.conditionTagList,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            {item.condition.map((item, index) => (
              <ConditionIcon
                key={index}
                item={{ id: index + 1, condition: item }}
                type="row"
              />
            ))}
          </View>
        )}
        {/* 노트 */}
        {item.content && <NoteText title={item.title} content={item.content} />}

        {/* 세트와 횟수 */}
        {item.setWithCount.length > 0 && (
          <View
            style={{
              backgroundColor: themeColor.itemColor,
              gap: 8,
            }}
          >
            {item.setWithCount.map((setCount) => (
              <SetListItem key={setCount.id} planId={item.id} item={setCount} />
            ))}
          </View>
        )}
        {item.imageUri?.length > 0 && !mediaLibrary && (
          <Text style={{ color: themeColor.subText, fontFamily: "sb-l" }}>
            갤러리 접근권한이 필요합니다.
          </Text>
        )}
        {mediaLibrary && item.imageUri?.length > 0 && (
          <View
            style={[
              styles.imageList,
              {
                backgroundColor: themeColor.itemColor,
                marginTop: 12,
              },
            ]}
          >
            {item.imageUri.map((imageItem) => {
              return (
                <Pressable
                  key={imageItem.id}
                  style={{ flex: 4, backgroundColor: themeColor.itemColor }}
                  onPress={() => setImageUri(imageItem.imageUri as string)}
                >
                  <Image
                    key={imageItem.id}
                    source={{ uri: imageItem.imageUri }}
                    style={[
                      styles.image,
                      {
                        borderColor: themeColor.itemColor,
                      },
                    ]}
                  />
                </Pressable>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
    gap: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    // borderWidth: 1,
    flex: 1,
  },
  iconLine: {
    // justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  workoutContainer: {
    flex: 1,
    gap: 14,
  },

  conditionTagList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageList: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
  },
  image: {
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
  },
})
