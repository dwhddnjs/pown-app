import React, { useEffect, useState } from "react";
// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/themed";
import { PlanForm } from "@/components/plan-form";
import { PlanDateButton } from "@/components/add-plan/plan-date-button";
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet";
import { toast } from "sonner-native";
// zustand
import { usePlanStore } from "@/hooks/use-plan-store";
import { useNoteStore } from "@/hooks/use-note-store";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/hooks/use-user-store";
// lib
import { format } from "date-fns";
import { PLAN_DATE_FORMAT } from "@/lib/date";
import { convertWeightToKg, saveImagesToLibrary } from "@/lib/media";
import { tBodyPart } from "@/lib/i18n";
// type
import { WorkoutTypes } from "@/types/workout";
// expo
import { useNavigation } from "expo-router";
// icon
import { BODY_PART_ITEMS } from "@/constants/body-part";

export default function AddMultiPlan() {
  const { onReset, ...result } = usePlanStore();
  const { editingPlan, addTempPlan, updateTempPlan, clearEditingPlan } =
    useMultiPlanStore();
  const { onReset: onResetNote } = useNoteStore();
  const navigation = useNavigation();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

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
    // 진입 시 한 번만 — 이후 부위 변경은 onSelectType이 직접 스토어에 반영한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPlan]);

  const onSelectType = (type: WorkoutTypes) => {
    setSelectedType(type);
    const store = usePlanStore.getState();
    // 부위가 바뀌면 이전 부위의 운동 태그는 목록에 없다 — 선택을 비운다
    store.setPlanValue("workout", "");
    store.setPlanValue("type", type);
  };

  const onSubmitMultiPlan = async () => {
    try {
      if (!result.weight || !result.workout) {
        return toast.error(t("plan.requireFields"));
      }
      const imageUri = await saveImagesToLibrary(result.imageUri);
      const timestamp = format(result.date, PLAN_DATE_FORMAT);

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
        createdAt: editingPlan ? editingPlan.createdAt : timestamp,
        updatedAt: timestamp,
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

  // 날짜와 부위 선택 — 이 화면에만 있는 폼 머리말
  const header = (
    <View style={styles.header}>
      <View style={{ height: 12 }} />
      <View style={styles.dateSection}>
        <Text style={{ fontSize: 24 }}>{t("plan.selectPart")}</Text>
        <PlanDateButton />
      </View>
      <View style={styles.typeSection}>
        {BODY_PART_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.type}
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
              {tBodyPart(item.type, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <PlanForm
      workoutType={selectedType}
      onSubmit={onSubmitMultiPlan}
      header={header}
      extraSheets={<SelectTypeDateSheet />}
      onLeave={clearEditingPlan}
      saveButtonStyle={{ marginTop: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  dateSection: {
    alignItems: "center",
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
