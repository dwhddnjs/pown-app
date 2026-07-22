import React from "react"
// component
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Text } from "../themed"
// zustand
import { useLanguage, useUserStore } from "@/hooks/use-user-store"
import { useT } from "@/hooks/use-t"
import { tWorkout } from "@/lib/i18n"
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
// expo
import { useRouter } from "expo-router"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"

export const UserDataCard = () => {
  const { userInfo } = useUserStore()
  const currentUserInfo = userInfo[userInfo.length - 1]
  const themeColor = useCurrentThemeColor()
  const t = useT()
  const lang = useLanguage()
  const { push } = useRouter()

  const bigThree = [
    { id: 1, title: tWorkout("스쿼트", lang), weight: currentUserInfo?.sq },
    { id: 2, title: tWorkout("벤치프레스", lang), weight: currentUserInfo?.bp },
    { id: 3, title: tWorkout("데드리프트", lang), weight: currentUserInfo?.dl },
  ]
  const total = bigThree.reduce(
    (acc, item) => acc + (Number(item.weight) || 0),
    0
  )

  const bodyInfo = [
    {
      id: 1,
      title: t("userInfo.height"),
      value: currentUserInfo?.height ? `${currentUserInfo.height}cm` : "-",
    },
    {
      id: 2,
      title: t("userInfo.weight"),
      value: currentUserInfo?.weight ? `${currentUserInfo.weight}kg` : "-",
    },
    {
      id: 3,
      title: t("userInfo.age"),
      value: currentUserInfo?.age ? t("userInfo.ageValue", { n: currentUserInfo.age }) : "-",
    },
    {
      id: 4,
      title: t("userInfo.gender"),
      value:
        currentUserInfo?.gender === "male"
          ? t("userInfo.male")
          : currentUserInfo?.gender === "female"
          ? t("userInfo.female")
          : "-",
    },
  ]

  if (!currentUserInfo) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: themeColor.itemColor }]}
        onPress={() => push("/mypage/user-info")}
        activeOpacity={0.8}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t("userInfo.emptyTitle")}</Text>
          <Text style={[styles.emptyDesc, { color: themeColor.subText }]}>
            {t("userInfo.emptyDesc")}
          </Text>
          <View style={styles.emptyLink}>
            <Text style={[styles.emptyLinkText, { color: themeColor.tintText }]}>
              {t("userInfo.goWrite")}
            </Text>
            <AntDesign name="right" size={12} color={themeColor.tintText} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColor.itemColor }]}
      onPress={() => push("/mypage/user-info")}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: themeColor.subText }]}>
          {t("userInfo.sbd")}
        </Text>
        <View style={styles.editRow}>
          <Text style={[styles.editText, { color: themeColor.subText }]}>
            {t("common.edit")}
          </Text>
          <AntDesign name="right" size={11} color={themeColor.subText} />
        </View>
      </View>
      <Text style={[styles.total, { color: themeColor.tintText }]}>
        {total}
        <Text style={[styles.totalUnit, { color: themeColor.tintText }]}>
          {" "}
          kg
        </Text>
      </Text>
      <View
        style={[styles.statsRow, { backgroundColor: themeColor.background }]}
      >
        {bigThree.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <View
                style={[
                  styles.vDivider,
                  { backgroundColor: themeColor.itemColor },
                ]}
              />
            )}
            <View style={styles.stat}>
              <Text style={[styles.statTitle, { color: themeColor.subText }]}>
                {item.title}
              </Text>
              <Text style={styles.statValue}>
                {item.weight || "-"}
                {!!item.weight && (
                  <Text
                    style={[styles.statUnit, { color: themeColor.subText }]}
                  >
                    kg
                  </Text>
                )}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
      <View style={styles.bodyRow}>
        {bodyInfo.map((item) => (
          <View key={item.id} style={styles.bodyItem}>
            <Text style={[styles.bodyTitle, { color: themeColor.subText }]}>
              {item.title}
            </Text>
            <Text style={styles.bodyValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  editText: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  total: {
    fontSize: 32,
    fontFamily: "sb-b",
    fontVariant: ["tabular-nums"],
  },
  totalUnit: {
    fontSize: 16,
    fontFamily: "sb-m",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderCurve: "continuous",
    paddingVertical: 12,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "sb-b",
    fontVariant: ["tabular-nums"],
  },
  statUnit: {
    fontSize: 11,
    fontFamily: "sb-l",
  },
  vDivider: {
    width: 1,
    height: 28,
  },
  bodyRow: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  bodyItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  bodyTitle: {
    fontSize: 11,
    fontFamily: "sb-l",
  },
  bodyValue: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  emptyTitle: {
    fontSize: 16,
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "sb-l",
    textAlign: "center",
    lineHeight: 19,
  },
  emptyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 6,
  },
  emptyLinkText: {
    fontSize: 14,
  },
})
