import { StyleSheet } from "react-native"
import React from "react"
import { Dialog } from "../Dialog"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Button } from "../Button"
import { useRouter } from "expo-router"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { Text, View } from "../Themed"
import { toast } from "sonner-native"

interface RemoveShortsDialogProps {
  open: boolean
  setIsOpen: () => void
  position: number
}

export const RemoveShortsDialog = ({
  open,
  setIsOpen,
  position,
}: RemoveShortsDialogProps) => {
  const themeColor = useCurrneThemeColor()
  const { back } = useRouter()
  const { videos, setRemoveVideo } = useShortsStore()

  return (
    <Dialog isOpen={open} onClose={setIsOpen} modalHeight={300}>
      <View
        style={{
          backgroundColor: themeColor.itemColor,
          paddingHorizontal: 20,
          gap: 24,
        }}
      >
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 18,
            }}
          >
            정말 숏츠 영상을 삭제 할까요?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: themeColor.subText,
              fontFamily: "sb-l",
            }}
          >
            * 삭제하시면 다시 복구 할 수 없어요.
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeColor.itemColor,
            gap: 12,
          }}
        >
          <Button
            type="solid"
            style={{
              flex: 1,
              marginHorizontal: 0,
              backgroundColor: themeColor.subText,
            }}
            onPress={setIsOpen}
          >
            취소
          </Button>
          <Button
            type="solid"
            style={{
              flex: 1,
              marginHorizontal: 0,
              backgroundColor: themeColor.fail,
            }}
            onPress={() => {
              setRemoveVideo(videos[position].id)
              toast.success("숏츠가 삭제 되었습니다.")
              back()
            }}
          >
            삭제하기
          </Button>
        </View>
      </View>
    </Dialog>
  )
}

const styles = StyleSheet.create({})
