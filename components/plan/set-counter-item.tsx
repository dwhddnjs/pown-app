import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"
import TrashIcon from "@expo/vector-icons/Ionicons"
import PlusIcon from "@expo/vector-icons/AntDesign"
import { StyleSheet, TouchableOpacity } from "react-native"
import { SetWithCountType, usePlanStore } from "@/hooks/use-plan-store"

interface SetCounterItemProps {
  item: SetWithCountType
  index: number
}

export const SetCounterItem = ({ item, index }: SetCounterItemProps) => {
  const { setFilterSetWithCount, setSetWithCount, setWithCount } =
    usePlanStore()

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={styles.setTypeCount}>
          <View style={styles.numberBall}>
            <Text style={styles.numberBallText}>{index + 1}</Text>
          </View>
          <Text style={styles.type}>{item.set}</Text>
          <Text style={styles.typeText}>{`${item.count} 회`}</Text>
        </View>
        <View style={styles.iconWrapper}>
          <TouchableOpacity onPress={() => setFilterSetWithCount(item.id)}>
            <TrashIcon name="trash" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setSetWithCount({ ...item, id: setWithCount.length + 1 })
            }
          >
            <PlusIcon name="pluscircle" size={24} color={Colors.dark.tint} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    flexDirection: "row",
  },

  item: {
    width: "100%",
    backgroundColor: Colors.dark.itemColor,
    paddingVertical: 4,
    flexDirection: "row",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    gap: 8,
  },

  setTypeCount: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  numberBall: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 50,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBallText: {
    fontFamily: "sb-b",
    color: Colors.dark.text,
    textAlign: "center",
    fontSize: 12,
  },

  type: {
    fontFamily: "sb-m",
    color: Colors.dark.tint,
    fontSize: 14,
  },
  typeText: {
    fontFamily: "sb-m",
    color: Colors.dark.text,
    fontSize: 12,
  },
  iconWrapper: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    gap: 10,
  },
})
