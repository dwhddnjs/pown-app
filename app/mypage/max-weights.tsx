import { ScrollView, StyleSheet, TextInput, useColorScheme } from "react-native"
import React, { useState } from "react"
import { Text, View } from "@/components/Themed"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import Colors from "@/constants/Colors"
import { Button } from "@/components/Button"
import { useUserStore } from "@/hooks/use-user-store"
import { useRouter } from "expo-router"
import { toast } from "sonner-native"

export default function MaxWeights() {
  const { setUserData, ...result } = useUserStore()
  const [value, setValue] = useState({
    sq: result.sq ?? "",
    bp: result.bp ?? "",
    dl: result.dl ?? "",
  })
  const colorScheme = useColorScheme()

  const { back } = useRouter()

  const onSetValue = (type: string, newValue: string) => {
    setValue({
      ...value,
      [type]: newValue,
    })
  }

  const onSubmitWeight = () => {
    setUserData({ ...value })
    toast.success("3대중량이 추가 되었습니다!")
    back()
  }

  return (
    <KeyBoardAvoid
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <ScrollView
        style={[
          styles.main,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <View style={styles.sqBpDlO}>
          <View style={styles.itemContainer}>
            <Text>스쿼트</Text>
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
                value={value.sq}
                onChangeText={(value) => onSetValue("sq", value)}
                placeholder="0"
              />
              <Text>kg</Text>
            </View>
          </View>
          <View style={styles.itemContainer}>
            <Text>벤치프레스</Text>
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
                value={value.bp}
                onChangeText={(value) => onSetValue("bp", value)}
                placeholder="0"
              />
              <Text>kg</Text>
            </View>
          </View>
          <View style={styles.itemContainer}>
            <Text>데드리프트</Text>
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

    paddingTop: 36,
  },
  container: {
    flexDirection: "row",
    borderWidth: 2,

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
