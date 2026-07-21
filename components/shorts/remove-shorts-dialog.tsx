import { StyleSheet } from "react-native"
import { useT } from "@/hooks/use-t"
import React from "react"
import { Dialog } from "../dialog"
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { Button } from "../button"
import { useRouter } from "expo-router"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { Text, View } from "../themed"
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
  const t = useT()
  const themeColor = useCurrentThemeColor()
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
            {t("shorts.removeTitle")}
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
            {t("common.cancel")}
          </Button>
          <Button
            type="solid"
            style={{
              flex: 1,
              marginHorizontal: 0,
              backgroundColor: themeColor.fail,
            }}
            onPress={() => {
              const video = videos[position]
              if (!video) return
              setRemoveVideo(video.id)
              toast.success(t("shorts.removed"))
              back()
            }}
          >
            {t("common.deleteAction")}
          </Button>
        </View>
      </View>
    </Dialog>
  )
}

const styles = StyleSheet.create({})
