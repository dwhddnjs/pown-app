import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { userWorkoutPlanStore } from "./use-workout-plan-store"
import { useUserStore } from "./use-user-store"

export const useMonthlyPlanData = (date: string) => {
  const { workoutPlanList } = userWorkoutPlanStore()
  const { userInfo } = useUserStore()
  const filterWorkoutPlanList = workoutPlanList.filter((item) => {
    const year = item.createdAt.slice(0, 4)
    const month = item.createdAt.slice(5, 7)
    return `${year}${month}` === date
  })
  const filterUserInfoList = userInfo.filter((item) => {
    const year = item.createdAt.slice(0, 4)
    const month = item.createdAt.slice(5, 7)
    return `${year}${month}` === date
  })
  return {
    monthlyPlanData: filterWorkoutPlanList,
    monthlyUserInfoData: filterUserInfoList,
  }
}
