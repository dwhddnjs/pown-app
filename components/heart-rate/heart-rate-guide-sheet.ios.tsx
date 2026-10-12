import React, { forwardRef, useCallback } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/button";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

// 키를 여기서 조립한다 — i18n에 heartRate.guide{X}·{X}Desc가 없으면 타입에서 걸린다
const GUIDE_KEYS = ["Device", "Setting", "Island", "Record"] as const;

const CONTENT_PADDING = 20;

// 심박수 측정을 처음 시작할 때 한 번만 뜨는 안내. 건강 권한 창보다 먼저 떠서 무엇을
// 재는지·어떤 이어폰이 되는지 알려주고, 버튼을 누르면 그대로 권한 → 측정으로 이어진다.
export const HeartRateGuideSheet = forwardRef<
  BottomSheetModal,
  { onStart: () => void }
>(({ onStart }, ref) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  // 내용이 한 화면 안에 들어오는 짧은 안내라 고정 비율 대신 내용 높이에 맞춘다
  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: themeColor.background,
        borderCurve: "continuous",
      }}
      handleIndicatorStyle={{ backgroundColor: themeColor.subText }}
    >
      <BottomSheetView style={styles.sheet}>
        <Text style={styles.title}>{t("heartRate.guideTitle")}</Text>
        <Text style={[styles.lead, { color: themeColor.subText }]}>
          {t("heartRate.guideLead")}
        </Text>
        {GUIDE_KEYS.map((key) => (
          <View key={key} style={styles.item}>
            {/* 첫 줄 글자 높이 한가운데에 맞춘다 — center로 두면 문단 중앙으로 내려간다 */}
            <View style={[styles.dot, { backgroundColor: themeColor.fail }]} />
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{t(`heartRate.guide${key}`)}</Text>
              <Text style={[styles.itemDesc, { color: themeColor.subText }]}>
                {t(`heartRate.guide${key}Desc`)}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.footer}>
          <Text style={[styles.consent, { color: themeColor.subText }]}>
            {t("heartRate.guideConsent")}
          </Text>
          {/* Button solid의 기본 marginHorizontal 20은 본문 여백과 겹쳐 두 배로 들어간다 */}
          <Button
            type="solid"
            style={{ backgroundColor: themeColor.tint, marginHorizontal: 0 }}
            onPress={onStart}
          >
            {t("heartRate.start")}
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

HeartRateGuideSheet.displayName = "HeartRateGuideSheet";

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  lead: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  item: {
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
  },
  itemDesc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    paddingTop: 12,
    gap: 12,
  },
  consent: {
    fontFamily: "sb-l",
    fontSize: 12,
    lineHeight: 18,
  },
});
