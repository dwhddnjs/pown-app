import { useEffect } from "react";
import { View } from "@/components/themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { toast } from "sonner-native";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { EmptyRoutine } from "@/components/workout-plan/empty-routine";
import { FontAwesome6 } from "@expo/vector-icons";
import { HeaderIconButton } from "@/components/header-icon-button";
import { requestReviewOnce } from "@/lib/review";

export default function MultiPlanScreen() {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tempPlans, setMultiPlanMode, commitTempPlans, resetMultiPlan } =
    useMultiPlanStore();
  const { setWorkoutPlan } = useWorkoutPlanStore();

  useEffect(() => {
    setMultiPlanMode(true);
    return () => {
      resetMultiPlan();
    };
  }, []);

  const handleAddPlan = () => {
    router.push("/workout/add-multi-plan");
  };

  const onSaveAll = () => {
    if (tempPlans.length === 0) {
      return toast.error(t("routine.noWorkout"));
    }
    const baseId = Date.now();
    tempPlans.forEach((plan, idx) => {
      setWorkoutPlan({
        ...plan,
        id: baseId + idx,
      });
    });
    // 커밋된 기록이 같은 사진 파일을 가리키므로 먼저 비운다 —
    // 그래야 화면이 닫히며 도는 resetMultiPlan이 그 사진을 지우지 않는다
    commitTempPlans();
    router.back();
    toast.success(t("routine.savedCount", { n: tempPlans.length }));
    // add-plan과 같은 기준(기록 3개)으로 청한다 — 리뷰 요청은 앱 생애 한 번뿐이라
    // 첫 저장에서 태워버리면 정작 애착이 생긴 뒤에는 다시 뜨지 않는다.
    // 커밋이 이미 끝났으니 이번 루틴의 운동들도 개수에 포함된다.
    if (useWorkoutPlanStore.getState().workoutPlanList.length >= 3) {
      setTimeout(() => requestReviewOnce().catch(() => {}), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () =>
            tempPlans.length === 0 ? null : (
              <HeaderIconButton type="save" onPress={onSaveAll} />
            ),
        }}
      />
      {tempPlans.length === 0 ? (
        <EmptyRoutine onPress={handleAddPlan} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={{
              borderRadius: 12,
              borderCurve: "continuous",
              overflow: "hidden",

              backgroundColor: themeColor.itemColor,
            }}
          >
            {[...tempPlans].reverse().map((plan, index) => (
              <WorkoutPlan
                key={plan.id}
                item={plan}
                index={index}
                totalLength={tempPlans.length}
                hideProgress
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* 화면 끝에서 40 — 안드로이드 3버튼 내비(48)처럼 하단 인셋이 크면 그 위로 올린다
          (iPhone은 인셋 0·34라 어느 기종이든 40 그대로) */}
      <View
        style={[
          styles.addButtonContainer,
          { bottom: Math.max(40, insets.bottom + 6) },
        ]}
      >
        <TouchableOpacity
          onPress={handleAddPlan}
          style={[
            styles.addButton,
            {
              borderColor: themeColor.tint,
            },
          ]}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="plus" size={30} color={themeColor.tintText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    // 떠 있는 추가 버튼(bottom: 40)에 마지막 카드가 가리지 않게
    paddingBottom: 120,
  },
  addButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
