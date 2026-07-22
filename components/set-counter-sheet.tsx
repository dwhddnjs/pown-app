import { StyleSheet } from "react-native";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native-gesture-handler";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { Text, View } from "./themed";
import { Button } from "./button";
import { NumberBallIcon } from "./number-ball-icon";
import { countData, setTypeData } from "@/constants/constants";
import { usePlanStore } from "@/hooks/use-plan-store";
import { useLanguage } from "@/hooks/use-user-store";
import { tSetType } from "@/lib/i18n";

interface SetCountSheetProps {
  onClose: () => void;
  // 시트 열림/닫힘을 부모에 알린다 (폼 본문 아이템 숨김 처리에 사용)
  onOpenChange?: (isOpen: boolean) => void;
}

export const SetCounterSheet = forwardRef<BottomSheet, SetCountSheetProps>(
  ({ onOpenChange }, ref) => {
    const [picker, setPicker] = useState({
      set: "본 세트",
      count: "8 + α",
    });
    const [isOpen, setIsOpen] = useState(false);
    const { setSetWithCount, setWithCount, setFilterSetWithCount } =
      usePlanStore();
    const themeColor = useCurrentThemeColor();
    const t = useT();
    const lang = useLanguage();

    // 시트 상단 y좌표 — 쌓이는 목록을 시트 바로 위에 붙인다
    const animatedPosition = useSharedValue(0);
    const overlayStyle = useAnimatedStyle(() => ({
      height: animatedPosition.value,
    }));

    const onSelectedPicker = (type: string, value: string) => {
      setPicker((prev) => ({
        ...prev,
        [type]: value,
      }));
    };

    // "추가" — 폼에 즉시 커밋. 시트 위 목록에도 실시간으로 쌓인다.
    const onSetPlanStore = () => {
      setSetWithCount({
        ...picker,
        id: Date.now(),
        progress: "진행중",
      });
    };

    const snapPoints = useMemo(() => ["50%"], []);
    const onSheetChange = useCallback(
      (index: number) => {
        const open = index >= 0;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [onOpenChange],
    );

    return (
      <>
        {/* 시트 바로 위에 떠서 쌓이는 목록 — 이미 폼에 반영된 setWithCount를 그대로 보여준다 */}
        {isOpen && setWithCount.length > 0 && (
          <Animated.View
            style={[styles.overlay, overlayStyle]}
            pointerEvents="box-none"
          >
            <View style={[styles.panel, { backgroundColor: "transparent" }]}>
              {setWithCount.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.item,
                    {
                      borderColor: themeColor.tint,
                      backgroundColor: themeColor.background,
                    },
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <NumberBallIcon>{index + 1}</NumberBallIcon>
                    <Text style={[styles.itemType, { color: themeColor.tintText }]}>
                      {tSetType(item.set, lang)}
                    </Text>
                    <Text
                      style={[styles.itemCount, { color: themeColor.tintText }]}
                    >{`${item.count} 회`}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setFilterSetWithCount(item.id)}
                    style={{ paddingHorizontal: 4 }}
                  >
                    <Ionicons name="trash" size={20} color={themeColor.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <BottomSheet
          ref={ref}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={onSheetChange}
          animatedPosition={animatedPosition}
          backgroundStyle={{
            backgroundColor: themeColor.itemColor,
          }}
          handleIndicatorStyle={{
            backgroundColor: themeColor.subText,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingTop: 14,
              backgroundColor: themeColor.itemColor,
            }}
          >
            <View
              style={{
                width: "50%",
                backgroundColor: themeColor.itemColor,
              }}
            >
              <Text style={[styles.title, { color: themeColor.text }]}>
                {t("plan.setType")}
              </Text>
              <Picker
                selectedValue={picker.set}
                onValueChange={(itemValue) =>
                  onSelectedPicker("set", itemValue)
                }
              >
                {setTypeData.map((item) => (
                  <Picker.Item
                    key={item}
                    label={tSetType(item, lang)}
                    value={item}
                    color={themeColor.text}
                  />
                ))}
              </Picker>
            </View>

            <View
              style={{
                width: "50%",
                backgroundColor: themeColor.itemColor,
              }}
            >
              <Text style={[styles.title, { color: themeColor.text }]}>
                {t("plan.repCount")}
              </Text>
              <Picker
                selectedValue={picker.count}
                onValueChange={(itemValue) =>
                  onSelectedPicker("count", itemValue)
                }
              >
                {countData.map((item) => (
                  <Picker.Item
                    key={item}
                    label={item}
                    value={item}
                    color={themeColor.text}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View
            style={{
              paddingBottom: 44,
              backgroundColor: themeColor.itemColor,
            }}
          >
            <Button type="solid" onPress={onSetPlanStore}>
              {t("common.add")}
            </Button>
          </View>
        </BottomSheet>
      </>
    );
  },
);

SetCounterSheet.displayName = "SetCounterSheet";

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
  },
  // 시트 상단부터 위로 채워지는 투명 컨테이너. 패널은 시트 바로 위에 붙는다.
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    justifyContent: "flex-end",
  },
  // 알약을 감싸는 불투명 패널 (뒤 폼 비침 방지)
  panel: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemType: {
    fontFamily: "sb-m",
    fontSize: 14,
  },
  itemCount: {
    fontFamily: "sb-m",
    fontSize: 12,
  },
});
