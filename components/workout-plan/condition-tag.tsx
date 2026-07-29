import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "@/components/themed"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useLanguage } from "@/hooks/use-user-store"
import { tCondition } from "@/lib/i18n"
// icon
import { getIcon } from "@/components/add-plan/condition-icon"

// 계획 카드에 붙는 읽기 전용 컨디션 태그. 예전엔 ConditionIcon의 row 분기가
// 이 역할을 했는데, 그 컴포넌트는 추가 폼 스토어를 통째로 구독한다 —
// row는 그 값을 하나도 쓰지 않으면서 폼에 한 글자 칠 때마다 리스트에 보이는
// 모든 카드의 태그가 리렌더 대상이 됐다.
export const ConditionTag = React.memo(
  ({ condition }: { condition: string }) => {
    const themeColor = useCurrentThemeColor()
    const lang = useLanguage()

    return (
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: themeColor.itemColor,
            borderColor: themeColor.tint,
          },
        ]}
      >
        {getIcon(condition, 16, themeColor.tintText)}
        <Text style={[styles.rowText, { color: themeColor.tintText }]}>
          {tCondition(condition, lang)}
        </Text>
      </View>
    )
  }
)
ConditionTag.displayName = "ConditionTag"

const styles = StyleSheet.create({
  rowIcon: {
    borderWidth: 2,
    alignSelf: "flex-start",
    borderRadius: 50,
    paddingLeft: 2,
    paddingRight: 6,
    paddingVertical: 2,
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 5,
  },
  rowText: {
    fontSize: 10,
    fontFamily: "sb-l",
  },
})
