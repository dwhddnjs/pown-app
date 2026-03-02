import { Text, View } from "../Themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SetWithCountType, usePlanStore } from "@/hooks/use-plan-store";
import { NumberBallIcon } from "../number-ball-icon";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface SetCounterItemProps {
  item: SetWithCountType;
  index: number;
}

export const SetCounterItem = ({ item, index }: SetCounterItemProps) => {
  const { setFilterSetWithCount, setSetWithCount, setWithCount } =
    usePlanStore();
  const themeColor = useCurrentThemeColor();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.item,
          {
            backgroundColor: themeColor.background,
            borderColor: themeColor.subText,
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
          <Text style={[styles.type, { color: themeColor.tint }]}>
            {item.set}
          </Text>
          <Text
            style={[styles.typeText, { color: themeColor.tint }]}
          >{`${item.count} 회`}</Text>
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
            <Ionicons name="trash" size={22} color={themeColor.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingLeft: 12, paddingRight: 4 }}
            onPress={() => setSetWithCount({ ...item, id: Date.now() })}
          >
            <Ionicons name="copy" size={20} color={themeColor.tint} />
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
