import { useState } from "react";
// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/themed";
import Accordion from "react-native-collapsible/Accordion";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { transformWorkoutData } from "@/lib/date";
// icons
import FontAwesome from "@expo/vector-icons/FontAwesome";

export type FolderTree = ReturnType<typeof transformWorkoutData>;

interface WorkoutFolderTreeProps {
  data: FolderTree;
  // 연/월/일이 모두 정해졌을 때 "yyyy.MM.dd" 문자열로 알려준다
  onSelectDate: (date: string) => void;
}

// 폴더 한 줄 (연도·월 헤더와 날짜 파일이 같은 모양을 쓴다)
const TreeRow = ({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
}) => {
  const themeColor = useCurrentThemeColor();

  return (
    <View style={[styles.row, { backgroundColor: themeColor.background }]}>
      <FontAwesome
        name={icon}
        size={icon === "file-text" ? 18 : 20}
        color={themeColor.subText}
      />
      <Text style={[styles.rowText, { color: themeColor.subText }]}>
        {title}
      </Text>
    </View>
  );
};

// 연도 > 월 > 일 3단 폴더 트리. 열려 있는 섹션은 각 단계마다 하나뿐이고,
// 고른 값(숫자 문자열)을 쌓아 마지막 단계에서 "yyyy.MM.dd"로 합친다.
export const WorkoutFolderTree = ({
  data,
  onSelectDate,
}: WorkoutFolderTreeProps) => {
  const themeColor = useCurrentThemeColor();
  const [activeYears, setActiveYears] = useState<number[]>([]);
  const [activeMonths, setActiveMonths] = useState<number[]>([]);
  // selectedPath에는 표시용 title이 아니라 숫자 value("2025"/"03")가 담긴다
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const onChangeYear = (sections: number[]) => {
    setActiveYears(sections);
    if (sections.length === 0) {
      setSelectedPath([]);
      return;
    }
    setSelectedPath([data[sections[0]].value]);
  };

  const onChangeMonth = (sections: number[]) => {
    setActiveMonths(sections);
    if (sections.length === 0) {
      // 월이 닫히면 연도까지만 남긴다
      setSelectedPath((prev) => prev.slice(0, 1));
      return;
    }
    if (activeYears.length === 0) return;
    const month = data[activeYears[0]].content[sections[0]];
    setSelectedPath((prev) => [prev[0], month.value]);
  };

  const onPressDay = (day: string) => {
    const path = [...selectedPath, day];
    if (path.length < 3) return;

    onSelectDate(path.join("."));
    setSelectedPath([]);
    setActiveYears([]);
    setActiveMonths([]);
  };

  return (
    <Accordion
      activeSections={activeYears}
      sections={data}
      touchableComponent={TouchableOpacity}
      expandMultiple={false}
      renderHeader={(year, _, isActive) => (
        <TreeRow
          icon={isActive ? "folder-open" : "folder"}
          title={year.title}
        />
      )}
      renderContent={(year) => (
        <View
          style={[styles.content, { backgroundColor: themeColor.background }]}
        >
          <Accordion
            activeSections={activeMonths}
            sections={year.content}
            touchableComponent={TouchableOpacity}
            expandMultiple={false}
            renderHeader={(month, _, isActive) => (
              <TreeRow
                icon={isActive ? "folder-open" : "folder"}
                title={month.title}
              />
            )}
            renderContent={(month) => (
              <View
                style={[
                  styles.content,
                  { backgroundColor: themeColor.background },
                ]}
              >
                {month.content.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.row,
                      { backgroundColor: themeColor.background },
                    ]}
                    onPress={() => onPressDay(day.value)}
                  >
                    <FontAwesome
                      name="file-text"
                      size={18}
                      color={themeColor.subText}
                    />
                    <Text
                      style={[styles.rowText, { color: themeColor.subText }]}
                    >
                      {day.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            onChange={onChangeMonth}
            renderAsFlatList={false}
            duration={400}
          />
        </View>
      )}
      duration={400}
      onChange={onChangeYear}
      renderAsFlatList={false}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rowText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    paddingLeft: 36,
    paddingVertical: 6,
    gap: 8,
  },
});
