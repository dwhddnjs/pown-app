import {
  StyleSheet,
  TextInput,
  Touchable,
  TouchableOpacity,
} from "react-native"
import React from "react"
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import Colors from "@/constants/Colors"
import { usePlanStore } from "@/hooks/use-plan-store"
import { equipmentData } from "@/constants/constants"

export const EquipmentBox = () => {
  const { equipment, setPlanValue } = usePlanStore()

  const onPressEquipment = (item: string) => {
    setPlanValue("equipment", item)
  }

  return (
    <View style={styles.container}>
      <IconTitle style={{ gap: 7 }}>
        <WeightIcon name="weight-kilogram" size={20} color={Colors.dark.tint} />
        <Text style={{ fontSize: 16 }}>기구 종류</Text>
      </IconTitle>
      <View style={styles.box}>
        {equipmentData.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.item, equipment === item && styles.selected]}
            onPress={() => onPressEquipment(item)}
          >
            <Text
              style={[styles.text, equipment === item && styles.selectedText]}
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
  },

  selectedText: {
    color: Colors.dark.text,
  },

  text: {
    color: Colors.dark.tint,
  },

  item: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    // backgroundColor: Colors.dark.tint,
    marginVertical: 4,
    marginHorizontal: 4,
  },

  selected: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: Colors.dark.tint,
    marginVertical: 4,
    marginHorizontal: 4,
    borderRadius: 8,
  },

  box: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    borderRadius: 12,
    marginLeft: 24,
  },
})