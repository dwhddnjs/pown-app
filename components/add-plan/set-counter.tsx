import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { Octicons } from "@expo/vector-icons";
import { Button } from "../button";
import { IconTitle } from "../icon-title";
import { usePlanStore } from "@/hooks/use-plan-store";
import { SetCounterItem } from "./set-counter-item";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

interface SetCounterProps {
  onOpen: () => void;
  // 시트가 열려 있으면 폼 본문 아이템을 숨긴다.
  // (시트 위 오버레이 목록과 겹쳐 보이는 문제 방지 — 기존 아이템이 시트 위로 올라간 느낌)
  isSheetOpen: boolean;
}

export const SetCounter = ({ onOpen, isSheetOpen }: SetCounterProps) => {
  const { setWithCount } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <Octicons name="number" size={20} color={themeColor.tintText} />
          <Text style={{ fontSize: 16 }}>{t("plan.setAndReps")}</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tintText }]}>{t("common.optional")}</Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          onOpen();
        }}
      >
        {t("common.select")}
      </Button>
      {!isSheetOpen && setWithCount.length > 0 && (
        <View style={{ gap: 8 }}>
          {setWithCount?.map((item, index) => (
            <SetCounterItem key={item.id} item={item} index={index} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
  },

  subText: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
    alignItems: "flex-end",
  },
});
