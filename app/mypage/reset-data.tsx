// component
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "@/components/Themed"
import { mockupData } from "@/constants/constants"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { toast } from "sonner-native"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
import {
  userWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store"
// expo
import { useRouter } from "expo-router"
import * as DocumentPicker from "expo-document-picker"
import { shareAsync, isAvailableAsync } from "expo-sharing"
import * as FileSystem from "expo-file-system"

export default function ResetData() {
  const { onResetPlanList, onSetMockout, workoutPlanList } =
    userWorkoutPlanStore()

  const { userInfo, onReset, setUser } = useUserStore()
  const { back } = useRouter()
  const themeColor = useCurrneThemeColor()

  const jsonFile = {
    user: userInfo,
    workoutPlan: workoutPlanList,
  }
  const jsonData = JSON.stringify(jsonFile, null, 2)
  const fileUri = FileSystem.documentDirectory + "pown.json"

  const saveJsonFile = async () => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      if (await isAvailableAsync()) {
        const res = await shareAsync(fileUri, {
          mimeType: "application/json",
        })
      } else {
        console.log("공유 안됨")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const pickJsonFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      })

      if (result?.assets) {
        const jsonData = await FileSystem.readAsStringAsync(
          result?.assets[0]?.uri,
          {
            encoding: FileSystem.EncodingType.UTF8,
          }
        )
        const { user, workoutPlan } = JSON.parse(jsonData)
        setUser("userInfo", user)
        onSetMockout(workoutPlan)
        toast.success("운동계획 파일을 불러왔습니다!")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmit = () => {
    onResetPlanList()
    onReset()
    toast.success("모든 데이터가 초기화 되었습니다")
    back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tint }]}>
          당신이 기록한 운동 계획을 보관하세요.
        </Text>
        <Text style={styles.desc}>
          앱을 삭제하면 기록 했던 모든 운동 계획이 삭제됩니다.{"\n"}나중에
          당신이 돌아올 수 있다는 여지를 두기 위해{"\n"}백업 파일로 저장해서
          보관하는건 어떨까요 ?
        </Text>
      </View>
      <View>
        <TouchableOpacity
          style={[
            styles.item,
            {
              backgroundColor: themeColor.itemColor,
              borderBottomColor: themeColor.background,
            },
          ]}
          onPress={() => saveJsonFile()}
        >
          <Text>백업</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.item,
            {
              backgroundColor: themeColor.itemColor,
              borderBottomColor: themeColor.background,
            },
          ]}
          onPress={() => pickJsonFile()}
        >
          <Text>복원</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.item,
            {
              backgroundColor: themeColor.itemColor,
              borderBottomColor: themeColor.background,
            },
          ]}
          onPress={() => onSubmit()}
        >
          <Text>초기화</Text>
        </TouchableOpacity>
      </View>
      <Pressable
        style={{
          alignSelf: "flex-end",
          marginTop: 300,
          width: 50,
          height: 50,
        }}
        onPress={() => {
          onSetMockout(mockupData as WorkoutPlanTypes[])
          toast.success("목업데이터 생성 되었습니다")
          back()
        }}
      ></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    gap: 24,
  },

  textContainer: {
    gap: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
