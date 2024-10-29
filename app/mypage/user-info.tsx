import { ScrollView, StyleSheet, TextInput } from "react-native"
import React, { useState } from "react"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import Colors from "@/constants/Colors"
import { Button } from "@/components/Button"
import { Text, View } from "@/components/Themed"
import Checkbox from "expo-checkbox"
import { useUserStore } from "@/hooks/use-user-store"
import { router, useRouter } from "expo-router"

export default function UserInfo() {
  const [value, setValue] = useState({
    height: "",
    age: "",
    weight: "",
  })
  const [isChecked, setChecked] = useState({
    male: false,
    female: false,
  })
  const { setUserData } = useUserStore()
  const { back } = useRouter()

  const onSetValue = (type: string, newValue: string) => {
    setValue({
      ...value,
      [type]: newValue,
    })
  }

  const onSetCheckBox = (type: "male" | "female") => {
    if (type === "male") {
      setChecked({
        male: true,
        female: false,
      })
    }

    if (type === "female") {
      setChecked({
        male: false,
        female: true,
      })
    }
  }

  const onSubmitValue = () => {
    setUserData({
      ...value,
      gender: isChecked.male ? "male" : isChecked.female ? "female" : null,
    })
    back()
  }

  return (
    <KeyBoardAvoid style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <ScrollView>
        {/* 좌 */}
        <View style={styles.contentContainer}>
          <View style={styles.sqBpDlO}>
            <View style={styles.itemContainer}>
              <Text>키</Text>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  //   onFocus={(e) => onFocus(e.target)}
                  maxLength={3}
                  value={value.height}
                  onChangeText={(value) => onSetValue("height", value)}
                  placeholder="0"
                />
                <Text>cm</Text>
              </View>
            </View>
            <View style={styles.itemContainer}>
              <Text>몸무게</Text>
              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  //   onFocus={(e) => onFocus(e.target)}
                  maxLength={3}
                  value={value.weight}
                  onChangeText={(value) => onSetValue("weight", value)}
                  placeholder="0"
                />
                <Text>kg</Text>
              </View>
            </View>
          </View>

          {/* 우 */}
          <View style={styles.sqBpDlO}>
            <View style={styles.itemContainer}>
              <Text>나이</Text>
              <View style={[styles.container]}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  //   onFocus={(e) => onFocus(e.target)}
                  maxLength={3}
                  value={value.age}
                  onChangeText={(value) => onSetValue("age", value)}
                  placeholder="0"
                />
                <Text>살</Text>
              </View>
            </View>
            <View style={[styles.itemContainer, { gap: 10 }]}>
              <Text>성별</Text>
              <View style={{ gap: 18 }}>
                <View style={styles.section}>
                  <Checkbox
                    style={styles.checkbox}
                    value={isChecked.male}
                    onValueChange={() => onSetCheckBox("male")}
                    color={isChecked ? Colors.dark.tint : undefined}
                  />
                  <Text style={{ fontFamily: "sb-l", color: Colors.dark.tint }}>
                    남자
                  </Text>
                </View>
                <View style={styles.section}>
                  <Checkbox
                    style={styles.checkbox}
                    value={isChecked.female}
                    onValueChange={() => onSetCheckBox("female")}
                    color={isChecked ? Colors.dark.tint : undefined}
                  />
                  <Text style={{ fontFamily: "sb-l", color: Colors.dark.tint }}>
                    여자
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Button type="submit" onPress={onSubmitValue}>
        저장
      </Button>
    </KeyBoardAvoid>
  )
}

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkbox: {
    // margin: 8,
  },
  main: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 36,
    flexDirection: "row",
  },
  container: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 4,
    paddingLeft: 0,
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
    paddingBottom: 24,
    gap: 36,
  },
  itemContainer: {
    gap: 6,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 32,
    gap: 85,
  },
})
