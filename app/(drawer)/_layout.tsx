import { Text } from "@/components/Themed"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Drawer } from "expo-router/drawer"

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView
      {...props}
      style={{ paddingHorizontal: 12, backgroundColor: "red" }}
    >
      <Text>뭘보노</Text>
    </DrawerContentScrollView>
  )
}

export default function Layout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    />
  )
}
