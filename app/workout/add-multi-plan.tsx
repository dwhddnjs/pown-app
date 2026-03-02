import React, { useCallback, useEffect, useRef, useState } from "react";
import { SetCounterSheet } from "@/components/SetCounterSheet";
import { Text, View } from "@/components/Themed";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { WorkoutTags } from "@/components/add-plan/workout-tags";
import { SetCounter } from "@/components/add-plan/set-counter";
import { TopWeight } from "@/components/add-plan/top-weight";
import { ConditionList } from "@/components/add-plan/condition-list";
import { PlanNote } from "@/components/add-plan/plan-note";
import { EquipmentBox } from "@/components/add-plan/equipment-box";
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store";
import { useFocusEffect, useNavigation } from "expo-router";
import { format } from "date-fns";
import Entypo from "@expo/vector-icons/Entypo";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid";
import { CameraImage } from "@/components/add-plan/camera-image";
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet";
import { AddWorkoutTagDialog } from "@/components/add-plan/add-workout-tag-dialog";
import { useUserStore } from "@/hooks/use-user-store";
import { RemoveWorkoutTagDialog } from "@/components/add-plan/remove-workout-tag-dialog";
import { TitleSearchHeader } from "@/components/add-plan/title-search-header";
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet";
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
import Arm from "@/assets/images/svg/arm_icon.svg";
import Back from "@/assets/images/svg/back_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";

export interface InputRefObject {
  measure: (
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number,
    ) => void,
  ) => void;
}

const iconButtonData = [
  { id: 1, title: "등", icon: Back, type: "back" as WorkoutTypes },
  { id: 2, title: "가슴", icon: Chest, type: "chest" as WorkoutTypes },
  { id: 3, title: "어깨", icon: Shoulder, type: "shoulder" as WorkoutTypes },
  { id: 4, title: "하체", icon: Leg, type: "leg" as WorkoutTypes },
  { id: 5, title: "팔", icon: Arm, type: "arm" as WorkoutTypes },
];

export default function AddMultiPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const workoutTagRef = useRef<BottomSheetModal>(null);
  const { onReset, date } = usePlanStore();
  const { workoutList } = useUserStore();
  const { editingPlan, clearEditingPlan } = useMultiPlanStore();
  const navigation = useNavigation();
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const themeColor = useCurrentThemeColor();
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const { open, setOpen } = useIsDialogOpenStore();

  const [selectedType, setSelectedType] = useState<WorkoutTypes>(
    (editingPlan?.type as WorkoutTypes) || "back",
  );

  useEffect(() => {
    if (editingPlan) {
      const { setPrevPlanValue } = usePlanStore.getState();
      setPrevPlanValue({
        workout: editingPlan.workout,
        type: editingPlan.type,
        equipment: editingPlan.equipment,
        weight: editingPlan.weight,
        condition: editingPlan.condition,
        title: editingPlan.title,
        content: editingPlan.content,
        setWithCount: editingPlan.setWithCount,
        imageUri: editingPlan.imageUri,
      });
      setSelectedType(editingPlan.type as WorkoutTypes);
    } else {
      usePlanStore.getState().setPlanValue("type", selectedType);
    }
  }, [editingPlan]);

  const onSelectType = (type: WorkoutTypes) => {
    setSelectedType(type);
    const store = usePlanStore.getState();
    store.setPlanValue("workout", "");
    store.setPlanValue("type", type);
  };

  const onWorkoutTagSheetClose = () => {
    if (isWorkoutTagModalOpen) {
      Keyboard.dismiss();
      setIsWorkoutTagModalOpen(false);
      workoutTagRef.current?.close();
    }
  };

  const onWorkoutTagSheetOpen = () => {
    setIsWorkoutTagModalOpen(true);
    workoutTagRef.current?.expand();
  };
  const onSheetClose = () => bottomSheetModalRef.current?.close();
  const onSheetOpen = () => bottomSheetModalRef.current?.expand();

  const onInputFocus = (node: InputRefObject) => {
    if (node) {
      node.measure(
        (
          fx: number,
          fy: number,
          width: number,
          h: number,
          px: number,
          py: number,
        ) => {
          scrollRef.current?.scrollTo({ y: py, animated: true });
        },
      );
    }
  };

  const onFocusScroll = (positionY: number) => {
    scrollRef.current?.scrollTo({ y: positionY, animated: true });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        onReset();
        clearEditingPlan();
      });
      return unsubscribe;
    }, [navigation]),
  );

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        style={{ flex: 1 }}
      >
        <View
          style={{
            paddingTop: 12,
            paddingBottom: 24,

            gap: 16,
          }}
        >
          {/* 날짜 선택 */}
          <View style={styles.dateSection}>
            <Text style={{ fontSize: 24 }}>지금 어느 부위를 조질까?</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpen(true)}
            >
              <Text style={{ color: themeColor.tint }}>
                {`📆 ${format(date, "yyyy년 M월 d일 h시 m분")}`}
              </Text>
              <Entypo name="select-arrows" size={18} color={themeColor.tint} />
            </TouchableOpacity>
          </View>

          {/* 부위 선택 */}
          <View style={styles.typeSection}>
            {iconButtonData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.typeItem}
                onPress={() => onSelectType(item.type)}
              >
                <View
                  style={[
                    styles.typeIconWrap,
                    selectedType === item.type && {
                      borderColor: themeColor.tint,
                      borderWidth: 4,
                    },
                  ]}
                >
                  <item.icon width={58} height={58} />
                </View>
                <Text style={[styles.typeLabel, { color: themeColor.text }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TitleSearchHeader onPress={onWorkoutTagSheetOpen} />
        <WorkoutTags workoutList={workoutList[selectedType]} />
        <EquipmentBox />
        <TopWeight
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        <SetCounter onOpen={onSheetOpen} />
        <ConditionList />
        <PlanNote
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
      <SearchWorkoutTagSheet
        workoutList={workoutList[selectedType]}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
      <AddWorkoutTagDialog workoutType={selectedType} />
      <RemoveWorkoutTagDialog workoutType={selectedType} />
      <SelectTypeDateSheet />
    </KeyBoardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 12,
  },
  dateSection: {
    alignItems: "center",
    // paddingVertical: 12,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 4,
  },
  typeSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  typeItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    // padding: 4,
  },
  typeIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
});
