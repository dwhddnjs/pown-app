import React, { useState } from "react"
// component
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import { Button } from "@/components/button"
import { Text, View } from "@/components/themed"
import { toast } from "sonner-native"
import { TitleInput } from "@/components/mypage/title-input"
// zustand
import { useLanguage, useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
// lib
import { format } from "date-fns"
import { tWorkout } from "@/lib/i18n"
// expo
import { useRouter } from "expo-router"

const RANGES: Record<string, [number, number]> = {
  height: [100, 250],
  weight: [20, 300],
  age: [1, 120],
  sq: [1, 500],
  bp: [1, 500],
  dl: [1, 500],
}

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
  const t = useT()
  const lang = useLanguage();

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
      return toast.error(t("userInfo.required"))
    }
    // 키 1111cm 같은 값이 그대로 저장돼 차트·요약을 망가뜨리는 걸 막는다
    const outOfRange = Object.entries(RANGES).some(([key, [min, max]]) => {
      const n = Number(value[key as keyof typeof value])
      return !Number.isFinite(n) || n < min || n > max
    })
    if (outOfRange) {
      return toast.error(t("userInfo.outOfRange"))
    }
    setUserData({
      ...value,
      gender,
      createdAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),
    })
    toast.success(t("userInfo.saved"))
    back()
  }

  const genderOptions = [
    { key: "male", label: t("userInfo.male") },
    { key: "female", label: t("userInfo.female") },
  ] as const

  return (
    <View style={{ flex: 1, paddingBottom: 48 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: themeColor.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColor.tintText }]}>
            {t("userInfo.title")}
          </Text>
          <Text style={[styles.desc, { color: themeColor.subText }]}>
            {t("userInfo.desc")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            {t("userInfo.sbd")}
          </Text>
          <View style={styles.inputRow}>
            <TitleInput
              title={tWorkout("스쿼트", lang)}
              label="kg"
              value={value.sq}
              onChangeValue={onSetValue}
              type="sq"
            />
            <TitleInput
              title={tWorkout("벤치프레스", lang)}
              label="kg"
              value={value.bp}
              onChangeValue={onSetValue}
              type="bp"
            />
            <TitleInput
              title={tWorkout("데드리프트", lang)}
              label="kg"
              value={value.dl}
              onChangeValue={onSetValue}
              type="dl"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            {t("userInfo.body")}
          </Text>
          <View style={styles.inputRow}>
            <TitleInput
              title={t("userInfo.height")}
              label="cm"
              value={value.height}
              onChangeValue={onSetValue}
              type="height"
            />
            <TitleInput
              title={t("userInfo.weight")}
              label="kg"
              value={value.weight}
              onChangeValue={onSetValue}
              type="weight"
            />
            <TitleInput
              title={t("userInfo.age")}
              label={t("userInfo.ageUnit")}
              value={value.age}
              onChangeValue={onSetValue}
              type="age"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColor.subText }]}>
            {t("userInfo.gender")}
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
                        color: isSelected ? themeColor.tintText : themeColor.subText,
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
        {t("common.save")}
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
