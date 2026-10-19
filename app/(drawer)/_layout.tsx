// component
import { View } from "react-native";
import { DrawerContent } from "@/components/drawer/drawer-content";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { Drawer } from "expo-router/drawer";
import { usePathname } from "expo-router";

export default function Layout() {
  const pathname = usePathname();
  const themeColor = useCurrentThemeColor();

  return (
    // 드로어 폭(80%) 바깥, 밀려난 카드의 둥근 모서리 뒤로 비치는 자리 — 안 깔면 루트(내비 테마)의
    // 검정이 비친다
    <View style={{ flex: 1, backgroundColor: themeColor.background }}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          // 드로어는 제자리에 깔려 있고 본문만 둥근 카드로 밀려난다 — 카드 모양·어둡게는 DrawerCard
          // (탭 레이아웃)가 그린다. 라이브러리 막은 네모라 투명으로 두고 탭하면 닫기만 맡긴다
          drawerType: "back",
          overlayColor: "transparent",
          // 화면을 감싸는 Screen은 내비 테마 배경(다크는 거의 검정)을 네모로 칠해 카드 모서리 밖으로
          // 같이 밀려 나온다 — 배경은 카드(DrawerCard)가 칠한다
          sceneStyle: { backgroundColor: "transparent" },
          drawerStyle: {
            // 카드가 80pt쯤 보이게 — 기본(화면 − 56)이면 56만 남아 모서리만 보인다
            width: "80%",
            // 뒤에 깐 배경과 같은 색 (기본은 내비 테마 card색)
            backgroundColor: themeColor.background,
          },
          // 운동 탭에서만 스와이프로 연다 — 다른 탭은 가로 스크롤·영상 제스처와 겹친다
          swipeEnabled: pathname === "/workout",
        }}
      />
    </View>
  );
}
