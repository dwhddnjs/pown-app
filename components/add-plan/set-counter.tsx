import { StyleSheet } from "react-native";
import { Text, View } from "../Themed";
import { Octicons } from "@expo/vector-icons";
import { Button } from "../Button";
import { IconTitle } from "../IconTitle";
import { usePlanStore } from "@/hooks/use-plan-store";
import { SetCounterItem } from "./set-counter-item";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface SetCounterProps {
  onOpen: () => void;
}

export const SetCounter = ({ onOpen }: SetCounterProps) => {
  const { setWithCount } = usePlanStore();
  const themeColor = useCurrentThemeColor();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <Octicons name="number" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tint }]}>(선택)</Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          onOpen();
        }}
      >
        선택하기
      </Button>
      {setWithCount.length > 0 && (
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
