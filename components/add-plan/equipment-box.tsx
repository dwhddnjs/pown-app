import {
  StyleSheet,
  TextInput,
  Touchable,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import React from "react"
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import Colors from "@/constants/Colors"
import { usePlanStore } from "@/hooks/use-plan-store"
import { equipmentData } from "@/constants/constants"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

export const EquipmentBox = () => {
  const { equipment, setPlanValue } = usePlanStore()
  const colorScheme = useColorScheme()

  const onPressEquipment = (item: string) => {
    setPlanValue("equipment", item)
  }

  return (
    <View style={styles.container}>
      <IconTitle style={{ gap: 7 }}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={20}
          color={Colors[colorScheme ?? "light"].tint}
        />
        <Text style={{ fontSize: 16 }}>기구 종류</Text>
      </IconTitle>
      <View
        style={[
          styles.box,
          { borderColor: Colors[colorScheme ?? "light"].tint },
        ]}
      >
        {equipmentData.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.item,
              equipment === item && {
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: Colors[colorScheme ?? "light"].tint,
                borderRadius: 8,
              },
            ]}
            onPress={() => onPressEquipment(item)}
          >
            <Text
              style={[
                { color: Colors[colorScheme ?? "light"].tint },
                equipment === item && {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
    flex: 1,
    paddingHorizontal: 24,
  },

  text: {},

  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  box: {
    flexDirection: "row",
    // alignSelf: "flex-start",
    justifyContent: "space-between",
    borderWidth: 2,

    borderRadius: 14,
    // marginHorizontal: 24,
    // flexWrap: "wrap",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
})
