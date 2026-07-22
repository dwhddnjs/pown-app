import { useState } from "react";
// component
import { Text, View } from "@/components/themed";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import Accordion from "react-native-collapsible/Accordion";
import { StyleSheet, TouchableOpacity } from "react-native";
// hook
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useLanguage } from "@/hooks/use-user-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { transformWorkoutData } from "@/lib/function";
// icons
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
// expo
import { useNavigation, usePathname, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [multipleSelect, setMultipleSelect] = useState(false);
  const { workoutPlanList } = useWorkoutPlanStore();
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const sortData = transformWorkoutData(workoutPlanList, lang);
  const t = useT();
  const navigation = useNavigation();
  const { push } = useRouter();

  const [activeSections2, setActiveSections2] = useState<number[]>([]);
  const [multipleSelect2, setMultipleSelect2] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string[]>([]);
  const { date, onSetDate } = useSelectDateStore();
  const yearCount = sortData.length;
  const monthCount = sortData.reduce((acc: number, item) => {
    return acc + item.content.length;
  }, 0);
  const dayCount = sortData
    .map((item) => item.content)
    .flat()
    .reduce((acc, item) => acc + item.content.length, 0);

  // 특정 레벨의 title을 업데이트하는 함수
  const updateTitleAtLevel = (level: number, newTitle: string) => {
    setSelectedTitle((prev) => {
      const newTitles = [...prev];
      // 해당 레벨의 title 업데이트
      newTitles[level] = newTitle;
      // 해당 레벨 이후의 title들은 제거
      return newTitles.slice(0, level + 1);
    });
  };

  const handleSetActiveSections = (sections: number[]) => {
    setActiveSections(sections);
    if (sections.length > 0) {
      // section 배열의 첫 번째 인덱스를 사용하여 sortData에서 해당하는 섹션 데이터를 가져옴
      const section = sortData[sections[0]];
      updateTitleAtLevel(0, section.value);
    } else {
      // 섹션이 닫힐 때 모든 선택된 title 제거
      setSelectedTitle([]);
    }
  };

  const handleSetActiveSections2 = (sections: number[]) => {
    setActiveSections2(sections);
    if (activeSections.length > 0 && sections.length > 0) {
      // 첫 번째 레벨의 선택된 섹션 데이터
      const firstLevelSection = sortData[activeSections[0]];
      // 두 번째 레벨의 선택된 섹션 데이터
      const secondLevelSection = firstLevelSection.content[sections[0]];
      updateTitleAtLevel(1, secondLevelSection.value);
    } else if (sections.length === 0) {
      // 두 번째 레벨의 섹션이 닫힐 때 해당 레벨 이후의 title 제거
      setSelectedTitle((prev) => prev.slice(0, 1));
    }
  };

  const handleItemSelect = (day: string) => {
    const selectedDate = [...selectedTitle, day];

    if (selectedDate.length < 3) return;

    // selectedTitle에는 표시용 title이 아니라 숫자 value("2025"/"03"/"14")가 담긴다
    const result = selectedDate.join(".");

    onSetDate(result);
    setSelectedTitle([]);
    setActiveSections([]);
    setActiveSections2([]);
    props.navigation.closeDrawer();
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ paddingTop: 72, paddingBottom: 12, gap: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 18 }}>{t("drawer.title")}</Text>
            <Text
              style={{
                color: themeColor.subText,
                fontFamily: "sb-l",
                fontSize: 12,
              }}
            >
              {t("drawer.counts", {
                folders: yearCount + monthCount,
                files: dayCount,
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={{ paddingVertical: 8, paddingLeft: 12 }}
            onPress={() => {
              // MY는 드로어 아래 탭이라, 닫지 않으면 이동해도 드로어가 덮는다
              props.navigation.closeDrawer()
              push("/my")
            }}
          >
            <Ionicons
              name="settings-sharp"
              size={24}
              color={themeColor.subText}
            />
          </TouchableOpacity>
        </View>
      </View>
      {workoutPlanList.length === 0 ? (
        <View style={styles.emptyFolder}>
          <MaterialIcons
            name="folder-off"
            size={20}
            color={themeColor.subText}
          />
          <Text style={{ color: themeColor.subText, fontFamily: "sb-l" }}>
            {t("drawer.empty")}
          </Text>
        </View>
      ) : (
        <DrawerContentScrollView
          {...props}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            backgroundColor: themeColor.background,
          }}
          contentContainerStyle={{
            paddingTop: 12,
          }}
        >
          <Accordion
            activeSections={activeSections}
            sections={sortData}
            touchableComponent={TouchableOpacity}
            expandMultiple={multipleSelect}
            renderHeader={(section, _, isActive) => (
              <View
                style={[
                  styles.header,
                  { backgroundColor: themeColor.background },
                ]}
              >
                <FontAwesome
                  name={isActive ? "folder-open" : "folder"}
                  size={20}
                  color={themeColor.subText}
                />
                <Text
                  style={[styles.headerText, { color: themeColor.subText }]}
                >
                  {section.title}
                </Text>
              </View>
            )}
            renderContent={(section, _, isActive) => {
              return (
                <View
                  style={[
                    styles.content,
                    { backgroundColor: themeColor.background },
                  ]}
                >
                  <Accordion
                    activeSections={activeSections2}
                    sections={section.content}
                    touchableComponent={TouchableOpacity}
                    expandMultiple={multipleSelect2}
                    renderHeader={(section2, _, isActive2) => (
                      <View
                        style={[
                          styles.header,
                          {
                            backgroundColor: themeColor.background,
                          },
                        ]}
                      >
                        <FontAwesome
                          name={isActive2 ? "folder-open" : "folder"}
                          size={20}
                          color={themeColor.subText}
                        />
                        <Text
                          style={[
                            styles.headerText,
                            { color: themeColor.subText },
                          ]}
                        >
                          {section2.title}
                        </Text>
                      </View>
                    )}
                    renderContent={(section2, _, isActive2) => (
                      <View
                        style={[
                          styles.content,
                          {
                            backgroundColor: themeColor.background,
                          },
                        ]}
                      >
                        {section2.content.map((item, index) => (
                          <TouchableOpacity
                            key={item.value}
                            style={[
                              styles.header,
                              {
                                backgroundColor: themeColor.background,
                              },
                            ]}
                            onPress={() => handleItemSelect(item.value)}
                          >
                            <FontAwesome
                              name="file-text"
                              size={18}
                              color={themeColor.subText}
                            />
                            <Text
                              style={[
                                styles.headerText,
                                { color: themeColor.subText },
                              ]}
                            >
                              {item.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    onChange={handleSetActiveSections2}
                    renderAsFlatList={false}
                    duration={400}
                  />
                </View>
              );
            }}
            duration={400}
            onChange={handleSetActiveSections}
            renderAsFlatList={false}
          />
        </DrawerContentScrollView>
      )}
    </View>
  );
};

export default function Layout() {
  const pathname = usePathname();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: pathname === "/workout",
      }}
    />
  );
}

const styles = StyleSheet.create({
  emptyFolder: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    marginTop: 12,
  },
  header: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    // textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    paddingLeft: 36,
    paddingVertical: 6,
    gap: 8,
  },
});
