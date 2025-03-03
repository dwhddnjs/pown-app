import { useState } from "react"
// component
import { Text, View } from "@/components/Themed"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Drawer } from "expo-router/drawer"
import Accordion from "react-native-collapsible/Accordion"
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
// zustand
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useSelectDateStore } from "@/hooks/use-select-date-store"
// lib
import { transformWorkoutData } from "@/lib/function"
// icons
import FontAwesome from "@expo/vector-icons/FontAwesome"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

const CustomDrawerContent = (props: any) => {
  const [activeSections, setActiveSections] = useState<number[]>([])
  const [collapsed, setCollapsed] = useState(true)
  const [multipleSelect, setMultipleSelect] = useState(false)

  const { workoutPlanList } = userWorkoutPlanStore()

  const themeColor = useCurrneThemeColor()
  const sortData = transformWorkoutData(workoutPlanList)

  const [activeSections2, setActiveSections2] = useState<number[]>([])
  const [multipleSelect2, setMultipleSelect2] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<string[]>([])
  const { date, onSetDate } = useSelectDateStore()

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
    <DrawerContentScrollView
      {...props}
      style={{
        paddingHorizontal: 12,
        paddingTop: 24,
        backgroundColor: themeColor.background,
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
            <Text style={[styles.headerText, { color: themeColor.subText }]}>
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
                      style={[styles.headerText, { color: themeColor.subText }]}
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
  header: {
    backgroundColor: "#1a1a1a",
    paddingLeft: 10,
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
})
