import React, { useEffect } from "react";
// component
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { View } from "@/components/themed";
// zustand
import { useNoteStore } from "@/hooks/use-note-store";
import { usePlanStore } from "@/hooks/use-plan-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { Stack, useNavigation } from "expo-router";
// icon
import Checkcircle from "@expo/vector-icons/AntDesign";

export default function Note() {
  const { title, content, setValue, onReset } = useNoteStore();
  const { setPlanValue } = usePlanStore();
  const navigation = useNavigation();
  const themeColor = useCurrentThemeColor();

  const onSaveNote = () => {
    setPlanValue("title", title);
    setPlanValue("content", content);
    navigation.goBack();
  };

  // 수정 중이던 계획의 노트를 프리필하고, 모달이 닫히면(저장/취소 모두) 임시 스토어를 비운다
  useEffect(() => {
    const plan = usePlanStore.getState();
    setValue("title", plan.title);
    setValue("content", plan.content);
    return () => {
      onReset();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={onSaveNote}>
              <Checkcircle
                name="checkcircle"
                size={30}
                color={themeColor.tint}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <TextInput
        value={title}
        placeholder="제목 입력..."
        style={[
          styles.titleInput,
          {
            color: themeColor.text,
            borderBottomColor: themeColor.subText,
          },
        ]}
        placeholderTextColor={themeColor.subText}
        onChangeText={(value) => setValue("title", value)}
      />
      <TextInput
        value={content}
        multiline={true}
        numberOfLines={10}
        style={[
          styles.descInput,
          {
            color: themeColor.text,
          },
        ]}
        placeholder="설명을 넣어주세요..."
        placeholderTextColor={themeColor.subText}
        onChangeText={(value) => setValue("content", value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  titleInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    fontFamily: "sb-m",
    paddingVertical: 8,
    paddingLeft: 2,
  },
  descInput: {
    paddingLeft: 2,
    fontSize: 16,

    paddingVertical: 14,
    height: 300,
    fontFamily: "sb-l",
    textAlignVertical: "top",
  },
});
