import { Text, View } from "@/components/Themed"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Drawer } from "expo-router/drawer"
import { useState } from "react"
import Accordion from "react-native-collapsible/Accordion"
import {
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Pressable,
} from "react-native"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import Colors from "@/constants/Colors"
import { transformWorkoutData } from "@/lib/function"
import FontAwesome from "@expo/vector-icons/FontAwesome"

const CustomDrawerContent = (props: any) => {
  const [activeSections, setActiveSections] = useState<number[]>([])
  const [collapsed, setCollapsed] = useState(true)
  const [multipleSelect, setMultipleSelect] = useState(false)
  const { workoutPlanList } = userWorkoutPlanStore()
  const colorScheme = useColorScheme()
  const sortData = transformWorkoutData(workoutPlanList)
  const [activeSections2, setActiveSections2] = useState<number[]>([])
  const [multipleSelect2, setMultipleSelect2] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<string[]>([])

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
    updateTitleAtLevel(2, item)
    props.navigation.closeDrawer()
  }

  return (
    <DrawerContentScrollView
      {...props}
      style={{
        paddingHorizontal: 24,
        paddingTop: 24,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <Accordion
        activeSections={activeSections}
        sections={sortData}
        touchableComponent={TouchableOpacity}
        expandMultiple={multipleSelect}
        renderHeader={(section, _, isActive) => (
          <View
            style={[styles.header, isActive ? styles.active : styles.inactive]}
          >
            <FontAwesome
              name={isActive ? "folder-open" : "folder"}
              size={24}
              color={Colors[colorScheme ?? "light"].subText}
            />
            <Text
              style={[
                styles.headerText,
                { color: Colors[colorScheme ?? "light"].subText },
              ]}
            >
              {section.title}
            </Text>
          </View>
        )}
        renderContent={(section, _, isActive) => (
          <View
            style={[styles.content, isActive ? styles.active : styles.inactive]}
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
                  ]}
                >
                  <FontAwesome
                    name={isActive2 ? "folder-open" : "folder"}
                    size={24}
                    color={Colors[colorScheme ?? "light"].subText}
                  />
                  <Text
                    style={[
                      styles.headerText,
                      { color: Colors[colorScheme ?? "light"].subText },
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
                  ]}
                >
                  {section2.content.map((item) => (
                    <TouchableOpacity
                      style={[styles.header]}
                      onPress={() => handleItemSelect(item)}
                    >
                      <FontAwesome
                        name="file-text"
                        size={20}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                      <Text
                        key={item}
                        style={[
                          styles.headerText,
                          { color: Colors[colorScheme ?? "light"].subText },
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
        )}
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
    fontSize: 16,
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
