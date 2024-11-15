import { Text, View } from "@/components/Themed"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Drawer } from "expo-router/drawer"
import { useState } from "react"
import Accordion from "react-native-collapsible/Accordion"
import { Switch, ScrollView, StyleSheet, TouchableOpacity } from "react-native"

const BACON_IPSUM =
  "Bacon ipsum dolor amet chuck turducken landjaeger tongue spare ribs. Picanha beef prosciutto meatball turkey shoulder shank salami cupim doner jowl pork belly cow. Chicken shankle rump swine tail frankfurter meatloaf ground round flank ham hock tongue shank andouille boudin brisket. "

const CONTENT = [
  {
    title: "First",
    content: BACON_IPSUM,
  },
  {
    title: "Second",
    content: BACON_IPSUM,
  },
  {
    title: "Third",
    content: BACON_IPSUM,
  },
  {
    title: "Fourth",
    content: BACON_IPSUM,
  },
  {
    title: "Fifth",
    content: BACON_IPSUM,
  },
]

const CustomDrawerContent = (props: any) => {
  const [activeSections, setActiveSections] = useState<number[]>([])
  const [collapsed, setCollapsed] = useState(true)
  const [multipleSelect, setMultipleSelect] = useState(false)

  return (
    <DrawerContentScrollView
      {...props}
      style={{ paddingHorizontal: 12, backgroundColor: "#1a1a1a" }}
    >
      <Accordion
        activeSections={activeSections}
        sections={CONTENT}
        touchableComponent={TouchableOpacity}
        expandMultiple={multipleSelect}
        renderHeader={(section, _, isActive) => (
          <View
            style={[styles.header, isActive ? styles.active : styles.inactive]}
          >
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        )}
        renderContent={(section, _, isActive) => (
          <View
            style={[styles.content, isActive ? styles.active : styles.inactive]}
          >
            <Text>{section.content}</Text>
          </View>
        )}
        duration={400}
        onChange={setActiveSections}
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
    backgroundColor: "#F5FCFF",
    padding: 10,
  },
  headerText: {
    // textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    padding: 20,
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
