// component
import { DrawerContent } from "@/components/drawer/drawer-content";
// expo
import { Drawer } from "expo-router/drawer";
import { usePathname } from "expo-router";

export default function Layout() {
  const pathname = usePathname();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // 운동 탭에서만 스와이프로 연다 — 다른 탭은 가로 스크롤·영상 제스처와 겹친다
        swipeEnabled: pathname === "/workout",
      }}
    />
  );
}
