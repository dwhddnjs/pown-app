import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "./themed";
import { Dialog } from "./dialog";
import { Button } from "./button";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  // 실행 버튼의 문구와 색 (삭제는 fail, 그 외는 tint)
  actionLabel: string;
  actionColor: string;
  onConfirm: () => void;
}

// "제목 / 설명 / 취소·실행" 두 버튼짜리 확인창. 데이터 초기화·운동 태그 삭제·숏츠
// 삭제가 각자 같은 마크업을 들고 있었다.
export const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  desc,
  actionLabel,
  actionColor,
  onConfirm,
}: ConfirmDialogProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <View
        style={[styles.container, { backgroundColor: themeColor.itemColor }]}
      >
        <View style={[styles.text, { backgroundColor: themeColor.itemColor }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.desc, { color: themeColor.subText }]}>
            {desc}
          </Text>
        </View>
        <View
          style={[styles.buttons, { backgroundColor: themeColor.itemColor }]}
        >
          <Button
            type="solid"
            style={{ ...styles.button, backgroundColor: themeColor.subText }}
            onPress={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="solid"
            style={{ ...styles.button, backgroundColor: actionColor }}
            onPress={onConfirm}
          >
            {actionLabel}
          </Button>
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  text: {
    gap: 4,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  // Button은 solid에 marginHorizontal 20을 기본으로 주므로 여기서 지운다
  button: {
    flex: 1,
    marginHorizontal: 0,
  },
});
