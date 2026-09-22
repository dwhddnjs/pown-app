import React from "react";
// component
import { ScrollView, StyleSheet } from "react-native";
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
  // 글자 크기까지 직접 잡아야 하면 desc 대신 content로 그린다
  desc?: string;
  // 실행 버튼의 문구와 색 (삭제는 fail, 그 외는 tint)
  actionLabel: string;
  actionColor: string;
  onConfirm: () => void;
  // 설명만으로는 묻히는 내용을 호출부가 직접 그려 넣는 자리
  // (예: AI 분석 전 촬영 조건 박스). 제목과 설명 사이에 들어간다.
  content?: React.ReactNode;
  // 버튼 바로 위에 붙는 자리. 누르기 직전에 읽어야 하는 고지(광고·데이터 전송)를
  // 본문이 아니라 버튼과 한 덩어리로 묶는다.
  footer?: React.ReactNode;
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
  content,
  footer,
}: ConfirmDialogProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <View
        style={[
          styles.container,
          // 박스가 들어가면 박스 자체가 이미 면으로 갈라줘서 24는 너무 벌어진다
          content ? styles.tightContainer : null,
          { backgroundColor: themeColor.itemColor },
        ]}
      >
        {/* 제목·설명·본문만 스크롤에 넣는다. 버튼과 그 위 고지(광고·데이터 전송)는
            눌리기 직전에 반드시 보여야 하므로 아래에 고정한다. 내용이 짧으면
            스크롤이 생기지 않아 지금까지와 똑같이 보인다. */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.text, { backgroundColor: themeColor.itemColor }]}
          >
            <Text style={styles.title}>{title}</Text>
            {desc ? (
              <Text style={[styles.desc, { color: themeColor.subText }]}>
                {desc}
              </Text>
            ) : null}
          </View>
          {/* 제목/설명 묶음(gap 4) 안에 두면 제목에만 바짝 붙는다 —
              컨테이너 직계로 올려 위아래 간격을 같게 둔다 */}
          {content}
        </ScrollView>
        <View
          style={[styles.actions, { backgroundColor: themeColor.itemColor }]}
        >
          {footer}
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
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tightContainer: {
    gap: 12,
  },
  // flexGrow:0 + flexShrink:1 — 내용이 짧으면 딱 그 높이로 하고, 천장(85%)에 닿으면
  // 버튼을 밀어내는 대신 자기가 줄어들며 스크롤이 된다
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  // 컨테이너의 gap이 스크롤 밖으로 빠졌으니 안쪽에서 같은 간격을 만든다
  scrollContent: {
    gap: 12,
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
  actions: {
    gap: 12,
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
