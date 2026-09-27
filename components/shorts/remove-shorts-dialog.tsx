import React from "react";
// component
import { ConfirmDialog } from "../confirm-dialog";
import { toast } from "sonner-native";
// zustand
import { useShortsStore } from "@/hooks/use-shorts-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// expo
import { useRouter } from "expo-router";

interface RemoveShortsDialogProps {
  open: boolean;
  setIsOpen: () => void;
  // 순서 번호가 아니라 id로 받는다 — 뷰어는 정렬된 목록을 보고 있어서
  // 스토어 배열의 같은 자리에 있는 건 다른 영상일 수 있다
  videoId?: number;
}

export const RemoveShortsDialog = ({
  open,
  setIsOpen,
  videoId,
}: RemoveShortsDialogProps) => {
  const t = useT();
  const themeColor = useCurrentThemeColor();
  const { back } = useRouter();
  const { setRemoveVideo } = useShortsStore();

  const onRemoveVideo = () => {
    if (videoId === undefined) return;
    setRemoveVideo(videoId);
    toast.success(t("shorts.removed"));
    back();
  };

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
  );
};
