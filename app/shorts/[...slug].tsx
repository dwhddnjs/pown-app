import { ShortsPlayer } from "@/components/shorts/shorts-player";
import { Text, View } from "@/components/themed";
import { useShortsStore } from "@/hooks/use-shorts-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowIcon from "@expo/vector-icons/AntDesign";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import Feather from "@expo/vector-icons/Feather";
import { format } from "date-fns";
import { formatDate } from "@/lib/function";
import { useLanguage } from "@/hooks/use-user-store";
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog";
import { StatusBar } from "expo-status-bar";

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>();

  const { videos } = useShortsStore();
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const { back } = useRouter();
  const initialPage = useMemo(() => {
    const index = videos.findIndex((v) => v.id === parseInt(slug?.[0]));
    return index >= 0 ? index : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [position, setPosition] = useState(initialPage);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<ScrollView>(null);

  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current || height === 0) {
      return;
    }
    ref.current.scrollTo({
      y: initialPage * height,
      animated: false,
    });
  }, [height, initialPage]);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: themeColor.hard }}
    >
      <StatusBar style="light" />
      <ScrollView
        ref={ref}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "black" }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        onScroll={(e) => {
          if (!height) {
            return;
          }
          const offsetY = e.nativeEvent.contentOffset.y;
          const index = Math.round(offsetY / height);
          if (index !== position) {
            setPosition(index);
          }
        }}
      >
        {videos.map((item, index) => {
          return (
            <ShortsPlayer
              uri={item.video}
              key={item.id}
              height={height}
              isActive={index === position}
            />
          );
        })}
      </ScrollView>
      <View
        style={[
          styles.backButtonContainer,
          { backgroundColor: themeColor.hard },
        ]}
      >
        <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => back()}>
          <ArrowIcon name="left" size={28} color={themeColor.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16 }}>
          {videos[position]?.createdAt
            ? formatDate(format(new Date(videos[position].createdAt), "yyyy.MM.dd"), lang)
            : ""}
        </Text>
        <TouchableOpacity
          style={{ paddingRight: 16 }}
          onPress={() => setIsOpen(true)}
        >
          <Feather name="trash" size={24} color={themeColor.text} />
        </TouchableOpacity>
      </View>
      <RemoveShortsDialog
        open={isOpen}
        setIsOpen={() => setIsOpen(false)}
        position={position}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
