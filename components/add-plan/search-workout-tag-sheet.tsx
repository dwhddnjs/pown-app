import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { FontAwesome } from "@expo/vector-icons";
import { searchByInitial } from "@/lib/hangul";
import { usePlanStore } from "@/hooks/use-plan-store";
import { useLanguage } from "@/hooks/use-user-store";
import { tWorkout } from "@/lib/i18n";
import { tagChipStyles } from "./workout-tag";

interface SearchWorkoutTagSheetProps {
  onClose: () => void;
  workoutList: string[];
  isOpen: boolean;
}

export const SearchWorkoutTagSheet = forwardRef<
  BottomSheet,
  SearchWorkoutTagSheetProps
>(({ onClose, workoutList, isOpen }, ref) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { workout, setPlanValue } = usePlanStore();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<TextInput | null>(null);

  const snapPoints = useMemo(() => ["80%"], []);
  const filterWorkoutTag = workoutList?.filter((tag) => {
    const searchLower = inputValue.toLowerCase().trim();
    const nameLower = tag.toLowerCase().trim();

    if (inputValue.length === 1 && /[ㄱ-ㅎ]/.test(inputValue)) {
      return searchByInitial(tag, inputValue);
    }
    // 저장값(한국어)과 표시 라벨 양쪽으로 매칭 — 영어로 입력해도 찾히게
    return (
      nameLower.includes(searchLower) ||
      tWorkout(tag, lang).toLowerCase().includes(searchLower)
    );
  });

  const onPressWorkout = (item: string) => {
    if (workout === item) {
      setPlanValue("workout", "");
      return;
    }
    setPlanValue("workout", item);
  };

  useEffect(() => {
    if (inputRef?.current && isOpen) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: themeColor.itemColor,
      }}
      handleIndicatorStyle={{
        backgroundColor: themeColor.subText,
      }}
    >
      <View style={styles.sheet}>
        <View
          style={[
            styles.searchIconContainer,
            {
              borderColor: themeColor.tint,
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
            autoCorrect={false}
            spellCheck={false}
            placeholder={t("tag.searchPlaceholder")}
            style={{ color: themeColor.text }}
            onChangeText={(text) => setInputValue(text)}
            value={inputValue}
          />
        </View>
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {filterWorkoutTag?.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                tagChipStyles.tag,
                { borderColor: themeColor.tint },
                item === workout && {
                  backgroundColor: themeColor.tint,
                },
              ]}
              onPress={() => onPressWorkout(item)}
            >
              <Text
                style={[
                  tagChipStyles.title,
                  { color: themeColor.tintText },
                  // tint로 채운 면 위 글자는 onTint (다크에서 text는 대비가 2:1도 안 된다)
                  item === workout && {
                    color: themeColor.onTint,
                  },
                ]}
              >
                {tWorkout(item, lang)}
              </Text>
            </TouchableOpacity>
          ))}
          {filterWorkoutTag?.length === 0 && (
            <Text style={{ color: themeColor.subText, fontFamily: "sb-m" }}>
              {t("tag.notFound")}
            </Text>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
});

SearchWorkoutTagSheet.displayName = "SearchWorkoutTagSheet";

const styles = StyleSheet.create({
  // 목록이 시트의 남은 높이를 다 먹어야 스크롤이 생긴다.
  // flex:1이 없으면 내용 높이 그대로 자라서 시트 밖으로 잘려 나간다.
  sheet: {
    flex: 1,
    paddingTop: 12,
    gap: 12,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    // 마지막 줄이 시트 바닥에 붙지 않게
    paddingBottom: 40,
    paddingHorizontal: 12,
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
});
