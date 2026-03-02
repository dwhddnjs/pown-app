import { useMemo } from "react";
import { useWorkoutPlanStore } from "./use-workout-plan-store";
import { useUserStore } from "./use-user-store";

export const useMonthlyPlanData = (date: string) => {
  const { workoutPlanList } = useWorkoutPlanStore();
  const { userInfo } = useUserStore();

  const monthlyPlanData = useMemo(
    () =>
      workoutPlanList.filter((item) => {
        const year = item.createdAt.slice(0, 4);
        const month = item.createdAt.slice(5, 7);
        return `${year}${month}` === date;
      }),
    [workoutPlanList, date],
  );

  const monthlyUserInfoData = useMemo(
    () =>
      userInfo.filter((item) => {
        const year = item.createdAt.slice(0, 4);
        const month = item.createdAt.slice(5, 7);
        return `${year}${month}` === date;
      }),
    [userInfo, date],
  );

  return { monthlyPlanData, monthlyUserInfoData };
};
