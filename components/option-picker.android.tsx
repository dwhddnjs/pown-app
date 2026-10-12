import React from "react";
// component
import { StyleSheet, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

type OptionPickerProps = {
  selectedValue: string;
  items: { label: string; value: string }[];
  onChange: (value: string) => void;
};

const FIELD_HEIGHT = 48;
const FIELD_MARGIN_TOP = 10;
// 아래 추가 버튼과의 간격 — 없으면 칸이 버튼에 붙어 보인다
const FIELD_MARGIN_BOTTOM = 9;

// 피커가 차지하는 높이 — 이걸 담는 시트가 높이를 맞춘다
export const OPTION_PICKER_HEIGHT =
  FIELD_HEIGHT + FIELD_MARGIN_TOP + FIELD_MARGIN_BOTTOM;

// 목록에서 하나 고르기 — 안드로이드엔 네이티브 휠이 없어 드롭다운을 쓴다.
// 맨 스피너는 테두리 없이 화면 끝에 붙어 떠 보여서, 앱의 다른 입력칸(목표 중량 등)처럼
// 테두리 친 칸에 담는다. 글자·화살표 색을 주지 않으면 다크 테마에서 묻힌다.
// 글꼴은 시스템 글꼴이다 — 네이티브 스피너는 앱이 실행 중에 불러온 글꼴(sb-*)을 못 쓴다
export const OptionPicker = ({
  selectedValue,
  items,
  onChange,
}: OptionPickerProps) => {
  const themeColor = useCurrentThemeColor();
  return (
    <View style={[styles.field, { borderColor: themeColor.tint }]}>
      <Picker
        mode="dropdown"
        selectedValue={selectedValue}
        onValueChange={onChange}
        dropdownIconColor={themeColor.text}
        style={{ color: themeColor.text }}
      >
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={themeColor.text}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    height: FIELD_HEIGHT,
    marginTop: FIELD_MARGIN_TOP,
    marginBottom: FIELD_MARGIN_BOTTOM,
    // 아래 추가 버튼(Button)과 좌우 끝을 맞춘다
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
    // 스피너는 자기 안쪽 여백까지 합쳐 칸보다 키가 크다 — 높이를 강제하면 글자가 아래로
    // 밀려 잘리므로 제 키대로 두고 가운데 맞춰 위아래 여백만 잘라낸다
    justifyContent: "center",
  },
});
