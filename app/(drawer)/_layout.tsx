import { useState } from "react"
// component
import { Text, View } from "@/components/Themed"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Drawer } from "expo-router/drawer"
import Accordion from "react-native-collapsible/Accordion"
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
// hook
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useSelectDateStore } from "@/hooks/use-select-date-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// lib
import { transformWorkoutData } from "@/lib/function"
// icons
import FontAwesome from "@expo/vector-icons/FontAwesome"
import Ionicons from "@expo/vector-icons/Ionicons"
// expo
import { useNavigation, usePathname, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { useIsModalOpenStore } from "@/hooks/use-is-modal-open-store"

const CustomDrawerContent = (props: any) => {
  const [activeSections, setActiveSections] = useState<number[]>([])
  const [collapsed, setCollapsed] = useState(true)
  const [multipleSelect, setMultipleSelect] = useState(false)
  const { workoutPlanList } = userWorkoutPlanStore()
  const themeColor = useCurrneThemeColor()
  const sortData = transformWorkoutData(workoutPlanList)
  const navigation = useNavigation()
  const { push } = useRouter()

  const [activeSections2, setActiveSections2] = useState<number[]>([])
  const [multipleSelect2, setMultipleSelect2] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<string[]>([])
  const { date, onSetDate } = useSelectDateStore()
  const yearCount = sortData.length
  const monthCount = sortData.reduce((acc: number, item) => {
    return acc + item.content.length
  }, 0)
  const dayCount = sortData
    .map((item) => item.content)
    .flat()
    .reduce((acc, item) => acc + item.content.length, 0)

  // 특정 레벨의 title을 업데이트하는 함수
  const updateTitleAtLevel = (level: number, newTitle: string) => {
    setSelectedTitle((prev) => {
      const newTitles = [...prev]
      // 해당 레벨의 title 업데이트
      newTitles[level] = newTitle
      // 해당 레벨 이후의 title들은 제거
      return newTitles.slice(0, level + 1)
    })
  }

  const handleSetActiveSections = (sections: number[]) => {
    setActiveSections(sections)
    if (sections.length > 0) {
      // section 배열의 첫 번째 인덱스를 사용하여 sortData에서 해당하는 섹션 데이터를 가져옴
      const section = sortData[sections[0]]
      updateTitleAtLevel(0, section.title)
    } else {
      // 섹션이 닫힐 때 모든 선택된 title 제거
      setSelectedTitle([])
    }
  }

  const handleSetActiveSections2 = (sections: number[]) => {
    setActiveSections2(sections)
    if (activeSections.length > 0 && sections.length > 0) {
      // 첫 번째 레벨의 선택된 섹션 데이터
      const firstLevelSection = sortData[activeSections[0]]
      // 두 번째 레벨의 선택된 섹션 데이터
      const secondLevelSection = firstLevelSection.content[sections[0]]
      updateTitleAtLevel(1, secondLevelSection.title)
    } else if (sections.length === 0) {
      // 두 번째 레벨의 섹션이 닫힐 때 해당 레벨 이후의 title 제거
      setSelectedTitle((prev) => prev.slice(0, 1))
    }
  }

  const handleItemSelect = (item: string) => {
    const selectedDate = [...selectedTitle, item]

    if (selectedDate.length === 0) return

    const result = `${selectedDate[0].slice(0, -1)}.${selectedDate[1].slice(
      0,
      -1
    )}.${selectedDate[2].slice(0, -1)}`

    onSetDate(result)
    setSelectedTitle([])
    setActiveSections([])
    setActiveSections2([])
    props.navigation.closeDrawer()
  }

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
            <Text style={{ fontSize: 18 }}>나의 운동 기록</Text>
            <Text
              style={{
                color: themeColor.subText,
                fontFamily: "sb-l",
                fontSize: 12,
              }}
            >
              {`폴더 ${yearCount + monthCount}개,  파일 ${dayCount}개`}
            </Text>
          </View>
          <TouchableOpacity
            style={{ paddingVertical: 8, paddingLeft: 12 }}
            onPress={() => push("/mypage/settings")}
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
            운동 폴더가 없습니다.
          </Text>
        </View>
      ) : (
        <DrawerContentScrollView
          {...props}
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
                  isActive ? styles.active : styles.inactive,
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
                    isActive ? styles.active : styles.inactive,
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
                          isActive2 ? styles.active : styles.inactive,
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
                          isActive2 ? styles.active : styles.inactive,
                          {
                            backgroundColor: themeColor.background,
                          },
                        ]}
                      >
                        {section2.content.map((item, index) => (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.header,
                              {
                                backgroundColor: themeColor.background,
                              },
                            ]}
                            onPress={() => handleItemSelect(item)}
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
                              {item}
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
              )
            }}
            duration={400}
            onChange={handleSetActiveSections}
            renderAsFlatList={false}
          />
        </DrawerContentScrollView>
      )}

      <TouchableOpacity
        onPress={() => {
          push("/(modals)/calculate")
        }}
        style={[
          styles.calculateButton,
          {
            backgroundColor: themeColor.background,
            borderColor: themeColor.subText,
          },
        ]}
      >
        <MaterialIcons name="calculate" size={40} color={themeColor.tint} />
      </TouchableOpacity>
    </View>
  )
}

export default function Layout() {
  const pathname = usePathname()

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: pathname === "/workout",
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "300",
    marginBottom: 20,
  },
  emptyFolder: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    marginTop: 12,
  },
  header: {
    backgroundColor: "#1a1a1a",
    // paddingLeft: 10,
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
    backgroundColor: "#fff",
  },
  active: {
    backgroundColor: "#1a1a1a",
  },
  inactive: {
    backgroundColor: "#1a1a1a",
  },
  selectors: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  selector: {
    // backgroundColor: "#F5FCFF",
    padding: 10,
  },
  activeSelector: {
    fontWeight: "bold",
  },
  selectTitle: {
    fontSize: 14,
    fontWeight: "500",
    padding: 10,
  },
  multipleToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 30,
    alignItems: "center",
  },
  multipleToggle__title: {
    fontSize: 16,
    marginRight: 8,
  },
  calculateButton: {
    width: 64,
    height: 64,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
    bottom: 64,
    right: 20,
    zIndex: 1000,
  },
})
