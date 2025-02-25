import Colors from "@/constants/Colors"
import { useColorScheme } from "react-native"

const useCurrneThemeColor = () => {
  const colorScheme = useColorScheme()

  return Colors[colorScheme ?? "light"]
}

export default useCurrneThemeColor
