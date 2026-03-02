import Colors from "@/constants/Colors"
import { useColorScheme } from "react-native"

const useCurrentThemeColor = () => {
  const colorScheme = useColorScheme()

  return Colors[colorScheme ?? "light"]
}

export default useCurrentThemeColor
