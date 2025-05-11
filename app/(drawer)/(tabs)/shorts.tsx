import { useEffect, useRef } from "react"
// component
import {
  AppState,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "@/components/Themed"
import { IconTitle } from "@/components/IconTitle"
import { UserDataCard } from "@/components/mypage/user-data-card"
// expo
import { useRouter } from "expo-router"
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { mediaJSON } from "@/constants/constants"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TabTwoScreen() {
  const { onReset, ...result } = useUserStore()
  const themeColor = useCurrneThemeColor()
  const screenWidth = Dimensions.get("window").width

  const { push } = useRouter()

  const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

  return (
    <View style={{ flex: 1, borderWidth: 1 }}>
      <FlatList
        data={mockData}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "column",
              borderWidth: 1,
              borderColor: "white",
              alignSelf: "flex-start",
              maxWidth: screenWidth / 3,
            }}
          >
            <Text>{item.id}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={{
          width: 64,
          height: 64,
          borderWidth: 2,
          position: "absolute",
          borderColor: "white",
          bottom: 24,
          right: 24,
          borderRadius: 50,
        }}
        onPress={() => push("/shorts/video")}
      >
        <Text>Video</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    // backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: 8,
  },
})
