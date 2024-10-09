import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import EmotionIcon from "@expo/vector-icons/MaterialIcons"
import { FlashList } from "@shopify/flash-list"
import { condition } from "@/constants/condition"
import Colors from "@/constants/Colors"
import { IconTitle } from "../IconTitle"

export const ConditionList = () => {
  return (
    <View style={styles.main}>
      <IconTitle style={{ gap: 7 }}>
        <EmotionIcon name="emoji-emotions" size={20} color={Colors.dark.tint} />
        <Text style={{ fontSize: 16 }}>지금 컨디션</Text>
      </IconTitle>
      <View style={styles.container}>
        <FlashList
          data={condition}
          horizontal
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.icon,
                index === 0 && { marginLeft: 24 },
                index === condition.length - 1 && { marginRight: 24 },
              ]}
              key={item.id}
            >
              <View>{item.Icon}</View>
              <Text style={styles.text}>{item.condition}</Text>
            </TouchableOpacity>
          )}
          estimatedItemSize={65}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 12,
    gap: 10,
  },
  container: {
    width: "100%",
    height: 65,
    alignItems: "center",
  },

  icon: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    width: 50,
    height: 50,
    borderRadius: 50,
    gap: 1,
    marginLeft: 10,
  },
  text: {
    fontSize: 8,
    color: Colors.dark.tint,
  },
})
