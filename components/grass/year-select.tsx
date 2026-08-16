import { useRef, useState } from "react";
// component
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View as RNView,
} from "react-native";
import { Text } from "@/components/themed";
import Animated from "react-native-reanimated";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePopover } from "@/hooks/use-popover";
// lib
import { Lang } from "@/lib/i18n";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";

export const yearLabel = (year: string, lang: Lang) =>
  lang === "ko" ? `${year}년` : year;

interface YearSelectProps {
  years: string[];
  year: string;
  lang: Lang;
  onChange: (year: string) => void;
}

// 잔디 카드 오른쪽의 연도 필터. 드롭다운은 카드 밖을 눌러도 닫히도록 Modal로
// 띄우므로 버튼 좌표를 재서 붙인다.
export const YearSelect = ({
  years,
  year,
  lang,
  onChange,
}: YearSelectProps) => {
  const themeColor = useCurrentThemeColor();
  const { visible, open, close, style } = usePopover();
  const { width: windowWidth } = useWindowDimensions();
  const buttonRef = useRef<RNView>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(
    null,
  );

  const onPressButton = () => {
    if (visible) {
      close();
      return;
    }
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 4, right: windowWidth - (x + width) });
      open();
    });
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.button, { borderColor: themeColor.tint }]}
        onPress={onPressButton}
      >
        <Text style={[styles.buttonText, { color: themeColor.tintText }]}>
          {yearLabel(year, lang)}
        </Text>
        <AntDesign
          name={visible ? "up" : "down"}
          size={10}
          color={themeColor.tintText}
        />
      </TouchableOpacity>
      {/* 카드와 같은 itemColor면 구분이 안 돼 background를 쓴다 */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        {anchor && (
          <Animated.View
            // 버튼에서 아래로 펼쳐졌다가 다시 접히는 느낌
            style={[
              styles.dropdown,
              {
                top: anchor.top,
                right: anchor.right,
                backgroundColor: themeColor.background,
              },
              style,
            ]}
          >
            {years.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  onChange(item);
                  close();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        item === year ? themeColor.tintText : themeColor.text,
                    },
                  ]}
                >
                  {yearLabel(item, lang)}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 50,
  },
  buttonText: {
    fontFamily: "sb-l",
    fontSize: 12,
    // sb 폰트는 ascender 여백이 커서 lineHeight를 안 주면 글자가 박스 위쪽에 붙는다
    lineHeight: 16,
  },
  dropdown: {
    position: "absolute",
    // 버튼(위쪽 모서리)에서 펼쳐지도록
    transformOrigin: "top right",
    minWidth: 72,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});
