import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { StyleSheet } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"

export default function ThemeMode() {
  return (
    <View style={styles.main}>
      <View style={styles.item}>
        <Text>라이트 모드</Text>
        <Entypo name="check" size={20} color={Colors.dark.tint} />
      </View>
      <View style={styles.item}>
        <Text>다크 모드</Text>
        <Entypo name="check" size={20} color={Colors.dark.tint} />
      </View>
      <View style={styles.item}>
        <Text>시스템 기본 설정</Text>
        <Entypo name="check" size={20} color={Colors.dark.tint} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingTop: 36,
    flex: 1,
  },
  item: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: Colors.dark.itemColor,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
