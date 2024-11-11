import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"
import TrashIcon from "@expo/vector-icons/Ionicons"
import PlusIcon from "@expo/vector-icons/AntDesign"
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { SetWithCountType, usePlanStore } from "@/hooks/use-plan-store"
import { NumberBallIcon } from "../number-ball-icon"

interface SetCounterItemProps {
  item: SetWithCountType
  index: number
}

export const SetCounterItem = ({ item, index }: SetCounterItemProps) => {
  console.log("item: ", item)
  const { setFilterSetWithCount, setSetWithCount, setWithCount } =
    usePlanStore()
  const colorScheme = useColorScheme()

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.item,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderColor: Colors[colorScheme ?? "light"].subText,
          },
        ]}
      >
        <View
          style={[
            styles.setTypeCount,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
          ]}
        >
          <NumberBallIcon>{index + 1}</NumberBallIcon>
          <Text
            style={[
              styles.type,
              { color: Colors[colorScheme ?? "light"].tint },
            ]}
          >
            {item.set}
          </Text>
          <Text
            style={[
              styles.typeText,
              { color: Colors[colorScheme ?? "light"].tint },
            ]}
          >{`${item.count} 회`}</Text>
        </View>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: Colors[colorScheme ?? "light"].background },
          ]}
        >
          <TouchableOpacity onPress={() => setFilterSetWithCount(item.id)}>
            <TrashIcon
              name="trash"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setSetWithCount({ ...item, id: setWithCount.length + 1 })
            }
          >
            <PlusIcon
              name="pluscircle"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
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
    gap: 10,
  },
})
