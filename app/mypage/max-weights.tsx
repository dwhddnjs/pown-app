import { ScrollView, StyleSheet, TextInput } from "react-native"
import React, { useState } from "react"
import { Text, View } from "@/components/Themed"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import Colors from "@/constants/Colors"
import { Button } from "@/components/Button"
import { useUserStore } from "@/hooks/use-user-store"
import { useRouter } from "expo-router"

export default function MaxWeights() {
  const [value, setValue] = useState({
    sq: "",
    bp: "",
    dl: "",
  })
  const { setUserData } = useUserStore()
  const { back } = useRouter()

  const onSetValue = (type: string, newValue: string) => {
    setValue({
      ...value,
      [type]: newValue,
    })
  }

  const onSubmitWeight = () => {
    setUserData({ ...value })
    back()
  }

  return (
    <KeyBoardAvoid style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <ScrollView style={styles.main}>
        <View style={styles.sqBpDlO}>
          <View style={styles.itemContainer}>
            <Text>스쿼트</Text>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                //   onFocus={(e) => onFocus(e.target)}
                maxLength={3}
                value={value.sq}
                onChangeText={(value) => onSetValue("sq", value)}
                placeholder="0"
              />
              <Text>kg</Text>
            </View>
          </View>
          <View style={styles.itemContainer}>
            <Text>벤치프레스</Text>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                //   onFocus={(e) => onFocus(e.target)}
                maxLength={3}
                value={value.bp}
                onChangeText={(value) => onSetValue("bp", value)}
                placeholder="0"
              />
              <Text>kg</Text>
            </View>
          </View>
          <View style={styles.itemContainer}>
            <Text>데드리프트</Text>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                //   onFocus={(e) => onFocus(e.target)}
                maxLength={3}
                value={value.dl}
                onChangeText={(value) => onSetValue("dl", value)}
                placeholder="0"
              />
              <Text>kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Button type="submit" onPress={onSubmitWeight}>
        저장
      </Button>
    </KeyBoardAvoid>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 36,
  },
  container: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 4,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 10,
    // marginHorizontal: 24,
  },
  input: {
    textAlign: "right",
    color: Colors.dark.tint,
    minWidth: 40,
    fontSize: 16,
    fontFamily: "sb-l",
  },
  sqBpDlO: {
    justifyContent: "center",
    flexDirection: "row",
    // paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 32,
  },
  itemContainer: {
    gap: 6,
  },
})
