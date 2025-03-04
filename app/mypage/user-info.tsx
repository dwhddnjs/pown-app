import { ScrollView, StyleSheet, TextInput, useColorScheme } from "react-native"
import React, { useState } from "react"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import Colors from "@/constants/Colors"
import { Button } from "@/components/Button"
import { Text, View } from "@/components/Themed"
import Checkbox from "expo-checkbox"
import { useUserStore } from "@/hooks/use-user-store"
import { router, useRouter } from "expo-router"
import { toast } from "sonner-native"

export default function UserInfo() {
  const { setUserData, ...result } = useUserStore()
  const colorScheme = useColorScheme()
  const [value, setValue] = useState({
    height: result.weight ?? "",
    age: result.age ?? "",
    weight: result.weight ?? "",
  })
  const [isChecked, setChecked] = useState({
    male: result.gender === "male" ? true : false,
    female: result.gender === "female" ? true : false,
  })

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
    toast.success("내정보가 추가 되었습니다!")
    back()
  }

  return (
    <ScrollView
      style={[{ backgroundColor: Colors[colorScheme ?? "light"].background }]}
      contentContainerStyle={{
        gap: 48,
      }}
    >
      {/* 좌 */}
      <View style={styles.contentContainer}>
        <View style={styles.sqBpDlO}>
          <View style={styles.itemContainer}>
            <Text>키</Text>
            <View
              style={[
                styles.container,
                {
                  borderColor: Colors[colorScheme ?? "light"].subText,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? "light"].tint,
                  },
                ]}
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
            <View
              style={[
                styles.container,
                { borderColor: Colors[colorScheme ?? "light"].subText },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? "light"].tint },
                ]}
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
            <View
              style={[
                styles.container,
                { borderColor: Colors[colorScheme ?? "light"].subText },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[colorScheme ?? "light"].tint },
                ]}
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
                  color={
                    isChecked ? Colors[colorScheme ?? "light"].tint : undefined
                  }
                />
                <Text
                  style={{
                    fontFamily: "sb-l",
                    color: Colors[colorScheme ?? "light"].tint,
                  }}
                >
                  남자
                </Text>
              </View>
              <View style={styles.section}>
                <Checkbox
                  style={styles.checkbox}
                  value={isChecked.female}
                  onValueChange={() => onSetCheckBox("female")}
                  color={
                    isChecked ? Colors[colorScheme ?? "light"].tint : undefined
                  }
                />
                <Text
                  style={{
                    fontFamily: "sb-l",
                    color: Colors[colorScheme ?? "light"].tint,
                  }}
                >
                  여자
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <Button type="solid" onPress={onSubmitValue}>
        저장
      </Button>
    </ScrollView>
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
    paddingTop: 36,
    borderWidth: 1,
    flexDirection: "row",
  },
  container: {
    flexDirection: "row",
    borderWidth: 2,
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
    minWidth: 40,
    fontSize: 16,
    fontFamily: "sb-l",
  },
  sqBpDlO: {
    paddingBottom: 24,
    gap: 50,
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
