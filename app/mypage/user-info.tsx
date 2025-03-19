import React, { useState } from "react"
// component
import { ScrollView, StyleSheet } from "react-native"
import { Button } from "@/components/Button"
import { Text, View } from "@/components/Themed"
import { toast } from "sonner-native"
import { TitleInput } from "@/components/mypage/title-input"
// expo
import Checkbox from "expo-checkbox"
import { router, useRouter } from "expo-router"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
//lib
import { format } from "date-fns"

export default function UserInfo() {
  const { setUserData, userInfo } = useUserStore()

  const lastestUserInfo = userInfo[userInfo.length - 1]

  const [value, setValue] = useState({
    height: lastestUserInfo?.weight ?? "",
    age: lastestUserInfo?.age ?? "",
    weight: lastestUserInfo?.weight ?? "",
    sq: lastestUserInfo?.sq ?? "",
    bp: lastestUserInfo?.bp ?? "",
    dl: lastestUserInfo?.dl ?? "",
  })

  const [isChecked, setChecked] = useState({
    male: lastestUserInfo?.gender === "male" ? true : false,
    female: lastestUserInfo?.gender === "female" ? true : false,
  })
  const themeColor = useCurrneThemeColor()

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
    if (
      !value.height ||
      !value.age ||
      !value.weight ||
      !value.sq ||
      !value.bp ||
      !value.dl
    ) {
      return toast.error("정보를 모두 기입해주세요!")
    }
    setUserData({
      ...value,
      gender: isChecked.male ? "male" : isChecked.female ? "female" : null,
      createdAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),
    })
    toast.success("내정보가 추가 되었습니다!")
    back()
  }

  return (
    <View style={{ flex: 1, paddingBottom: 48 }}>
      <ScrollView
        style={[{ backgroundColor: themeColor.background }]}
        contentContainerStyle={{
          gap: 24,
          paddingTop: 24,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColor.tint }]}>
            당신의 정보를 입력하세요.
          </Text>
          <Text style={styles.desc}>
            3대 중량, 나이, 성별, 신체 정보를 기입해보세요. 또한 중량을 늘때,
            몸무게가 줄때마다 기록을 갱신 해보세요 차트 데이터 기록에
            도움됩니다.
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TitleInput
            title="스쿼트"
            label="kg"
            value={value.sq}
            onChangeValue={onSetValue}
            type="sq"
          />
          <TitleInput
            title="벤치프레스"
            label="kg"
            value={value.bp}
            onChangeValue={onSetValue}
            type="bp"
          />
          <TitleInput
            title="데드리프트"
            label="kg"
            value={value.dl}
            onChangeValue={onSetValue}
            type="dl"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TitleInput
            title="키"
            label="cm"
            value={value.height}
            onChangeValue={onSetValue}
            type="height"
          />
          <TitleInput
            title="몸무게"
            label="kg"
            value={value.weight}
            onChangeValue={onSetValue}
            type="weight"
          />
          <TitleInput
            title="나이"
            label="살"
            value={value.age}
            onChangeValue={onSetValue}
            type="age"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text>성별</Text>
          <View style={{ gap: 18, flexDirection: "row" }}>
            <View style={styles.section}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked.male}
                onValueChange={() => onSetCheckBox("male")}
                color={isChecked ? themeColor.tint : undefined}
              />
              <Text
                style={{
                  fontFamily: "sb-l",
                  color: themeColor.tint,
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
                color={isChecked ? themeColor.tint : undefined}
              />
              <Text
                style={{
                  fontFamily: "sb-l",
                  color: themeColor.tint,
                }}
              >
                여자
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Button type="solid" onPress={onSubmitValue}>
        저장
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textContainer: {
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
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
