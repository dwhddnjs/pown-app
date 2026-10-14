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
        // iOS처럼 본문이 드로어와 같이 밀려난다 — 라이브러리 기본값이 iOS만 slide, 안드로이드는
        // 본문 위에 덮는 front다
        drawerType: "slide",
        // 운동 탭에서만 스와이프로 연다 — 다른 탭은 가로 스크롤·영상 제스처와 겹친다
        swipeEnabled: pathname === "/workout",
      }}
    />
  );
}
