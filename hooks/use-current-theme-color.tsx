import Colors from "@/constants/colors"
import { useColorScheme } from "react-native"

const useCurrentThemeColor = () => {
  const colorScheme = useColorScheme()

  return Colors[colorScheme ?? "light"]
}

export default useCurrentThemeColor
