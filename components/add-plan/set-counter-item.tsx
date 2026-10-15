import { Text, View } from "../themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { usePlanStore } from "@/hooks/use-plan-store";
import { SetWithCountType } from "@/types/workout";
import { NumberBallIcon } from "../number-ball-icon";
import { iconLine } from "@/constants/text-metrics";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tSetType } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";

interface SetCounterItemProps {
  item: SetWithCountType;
  index: number;
}

export const SetCounterItem = ({ item, index }: SetCounterItemProps) => {
  const { setFilterSetWithCount, setSetWithCount } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.item,
          {
            backgroundColor: themeColor.background,
            borderColor: themeColor.tint,
          },
        ]}
      >
        <View
          style={[
            styles.setTypeCount,
            {
              backgroundColor: themeColor.background,
            },
          ]}
        >
          <NumberBallIcon>{index + 1}</NumberBallIcon>
          <Text style={[styles.type, { color: themeColor.tintText }]}>
            {tSetType(item.set, lang)}
          </Text>
          <Text style={[styles.typeText, { color: themeColor.tintText }]}>
            {t("common.reps", { n: item.count })}
          </Text>
        </View>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: themeColor.background },
          ]}
        >
          <TouchableOpacity
            onPress={() => setFilterSetWithCount(item.id)}
            style={{ paddingLeft: 12 }}
          >
            <Ionicons
              name="trash"
              size={22}
              color={themeColor.text}
              // 이 아이콘이 세트 행 높이를 정한다 (안드로이드 글꼴 여백이면 행마다 0.86 길다)
              style={iconLine(22)}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingLeft: 12, paddingRight: 4 }}
            onPress={() => setSetWithCount({ ...item, id: Date.now() })}
          >
            <Ionicons
              name="copy"
              size={20}
              color={themeColor.tintText}
              style={iconLine(20)}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: "row",
  },

  item: {
    width: "100%",
    paddingVertical: 4,
    flexDirection: "row",
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    gap: 8,
  },

  setTypeCount: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  type: {
    fontFamily: "sb-m",
    fontSize: 14,
  },
  typeText: {
    fontFamily: "sb-m",

    fontSize: 12,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
});
