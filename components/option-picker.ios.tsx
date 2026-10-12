import React from "react";
// component
import { Picker } from "@react-native-picker/picker";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

type OptionPickerProps = {
  selectedValue: string;
  items: { label: string; value: string }[];
  onChange: (value: string) => void;
};

// 휠 피커의 기본 높이 — 이걸 담는 시트가 높이를 맞춘다
export const OPTION_PICKER_HEIGHT = 216;

// 목록에서 하나 고르기 — iOS 휠
export const OptionPicker = ({
  selectedValue,
  items,
  onChange,
}: OptionPickerProps) => {
  const themeColor = useCurrentThemeColor();
  return (
    <Picker selectedValue={selectedValue} onValueChange={onChange}>
      {items.map((item) => (
        <Picker.Item
          key={item.value}
          label={item.label}
          value={item.value}
          color={themeColor.text}
        />
      ))}
    </Picker>
  );
};
