import React, { useState } from "react"
// component
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import { Button } from "@/components/button"
import { Text, View } from "@/components/themed"
import { toast } from "sonner-native"
import { TitleInput } from "@/components/mypage/title-input"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
// lib
import { format } from "date-fns"
// expo
import { useRouter } from "expo-router"

export default function UserInfo() {
  const { setUserData, userInfo } = useUserStore()

  const lastestUserInfo = userInfo[userInfo.length - 1]

  const [value, setValue] = useState({
    height: lastestUserInfo?.height ?? "",
    age: lastestUserInfo?.age ?? "",
    weight: lastestUserInfo?.weight ?? "",
    sq: lastestUserInfo?.sq ?? "",
    bp: lastestUserInfo?.bp ?? "",
    dl: lastestUserInfo?.dl ?? "",
  })
  const [gender, setGender] = useState<"male" | "female" | null>(
    lastestUserInfo?.gender ?? null
  )

  const themeColor = useCurrentThemeColor()

  const { back } = useRouter()

  const onSetValue = (type: string, newValue: string) => {
    setValue({
      ...value,
      [type]: newValue,
    })
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
      gender,
      createdAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),
    })
    toast.success("내정보가 추가 되었습니다!")
    back()
  }

  const genderOptions = [
    { key: "male", label: "남자" },
    { key: "female", label: "여자" },
  ] as const

  return (
    <View style={{ flex: 1, paddingBottom: 48 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: themeColor.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColor.tint }]}>
            당신의 정보를 입력하세요.
          </Text>
          <Text style={[styles.desc, { color: themeColor.subText }]}>
            3대 중량, 나이, 성별, 신체 정보를 기입해보세요. 또한 중량이 늘 때,
            몸무게가 줄 때마다 기록을 갱신해보세요. 차트 데이터 기록에
            도움됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            3대 중량
          </Text>
          <View style={styles.inputRow}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            신체 정보
          </Text>
          <View style={styles.inputRow}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            성별
          </Text>
          <View style={styles.inputRow}>
            {genderOptions.map((option) => {
              const isSelected = gender === option.key
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.genderChip,
                    {
                      backgroundColor: themeColor.itemColor,
                      borderColor: isSelected ? themeColor.tint : "transparent",
                    },
                  ]}
                  onPress={() => setGender(option.key)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      {
                        color: isSelected ? themeColor.tint : themeColor.subText,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
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
  content: {
    gap: 28,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    paddingLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    fontSize: 15,
  },
})
