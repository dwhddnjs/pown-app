import React from "react"
// component
import { ConfirmDialog } from "../confirm-dialog"
import { toast } from "sonner-native"
// zustand
import { useShortsStore } from "@/hooks/use-shorts-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
// expo
import { useRouter } from "expo-router"

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

  const onRemoveVideo = () => {
    const video = videos[position]
    if (!video) return
    setRemoveVideo(video.id)
    toast.success(t("shorts.removed"))
    back()
  }

  return (
    <ConfirmDialog
      isOpen={open}
      onClose={setIsOpen}
      title={t("shorts.removeTitle")}
      desc={t("shorts.removeDesc")}
      actionLabel={t("common.deleteAction")}
      actionColor={themeColor.fail}
      onConfirm={onRemoveVideo}
    />
  )
}
