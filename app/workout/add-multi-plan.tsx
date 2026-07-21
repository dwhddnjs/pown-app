import React, { useCallback, useEffect, useRef, useState } from "react";
import { SetCounterSheet } from "@/components/set-counter-sheet";
import { Text, View } from "@/components/themed";
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
import { useNoteStore } from "@/hooks/use-note-store";
import { Stack, useFocusEffect, useNavigation } from "expo-router";
import { format } from "date-fns";
import { toast } from "sonner-native";
import { convertWeightToKg, saveImagesToLibrary } from "@/lib/media";
import Entypo from "@expo/vector-icons/Entypo";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { HeaderIconButton } from "@/components/header-icon-button";
import { KeyBoardAvoid } from "@/components/keyboard-avoid";
import { CameraImage } from "@/components/add-plan/camera-image";
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet";
import { AddWorkoutTagDialog } from "@/components/add-plan/add-workout-tag-dialog";
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
import { formatPlanDateTime } from "@/lib/date";
import { tBodyPart } from "@/lib/i18n";
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
  { id: 1, titleKey: "back", icon: Back, type: "back" as WorkoutTypes },
  { id: 2, titleKey: "chest", icon: Chest, type: "chest" as WorkoutTypes },
  { id: 3, titleKey: "shoulder", icon: Shoulder, type: "shoulder" as WorkoutTypes },
  { id: 4, titleKey: "leg", icon: Leg, type: "leg" as WorkoutTypes },
  { id: 5, titleKey: "arm", icon: Arm, type: "arm" as WorkoutTypes },
];

export default function AddMultiPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const workoutTagRef = useRef<BottomSheetModal>(null);
  const { onReset, ...result } = usePlanStore();
  const { date } = result;
  const { workoutList } = useUserStore();
  const { editingPlan, addTempPlan, updateTempPlan, clearEditingPlan } =
    useMultiPlanStore();
  const { onReset: onResetNote } = useNoteStore();
  const navigation = useNavigation();
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false);
  const [isSetCounterSheetOpen, setIsSetCounterSheetOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
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

  const onSubmitMultiPlan = async () => {
    try {
      if (!result.weight || !result.workout) {
        return toast.error(t("plan.requireFields"));
      }
      const imageUri = await saveImagesToLibrary(result.imageUri);

      const planObj = {
        id: editingPlan ? editingPlan.id : Date.now(),
        workout: result.workout,
        type: result.type || editingPlan?.type || "back",
        equipment: result.equipment,
        weight: convertWeightToKg(result.weight, result.weightType),
        condition: result.condition,
        content: result.content,
        title: result.title,
        setWithCount: result.setWithCount,
        createdAt: editingPlan
          ? editingPlan.createdAt
          : format(result.date, "yyyy.MM.dd HH:mm:ss"),
        updatedAt: format(result.date, "yyyy.MM.dd HH:mm:ss"),
        imageUri,
      };

      if (editingPlan) {
        updateTempPlan(planObj);
      } else {
        addTempPlan(planObj);
      }
      onReset();
      clearEditingPlan();
      navigation.goBack();
      onResetNote();
      return toast.success(
        editingPlan ? t("plan.updated") : t("routine.addedToRoutine"),
      );
    } catch {
      toast.error(t("plan.addFailed"));
    }
  };

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderIconButton
              type="save"
              onPress={onSubmitMultiPlan}
              style={{ marginTop: 16 }}
            />
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
            <Text style={{ fontSize: 24 }}>{t("plan.selectPart")}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpen(true)}
            >
              <Text style={{ color: themeColor.tint }}>
                {`📆 ${formatPlanDateTime(date, lang)}`}
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
                  {tBodyPart(item.titleKey, lang)}
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
        <SetCounter onOpen={onSheetOpen} isSheetOpen={isSetCounterSheetOpen} />
        <ConditionList />
        <PlanNote
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet
        ref={bottomSheetModalRef}
        onClose={onSheetClose}
        onOpenChange={setIsSetCounterSheetOpen}
      />
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
