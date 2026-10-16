// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../themed";
import { Button } from "../button";
import { IconTitle } from "../icon-title";
import { iconLine } from "@/constants/text-metrics";
// expo
import { useRouter } from "expo-router";
import { Image } from "expo-image";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { usePlanStore } from "@/hooks/use-plan-store";
// lib
import { imageRows, resolveMediaUri } from "@/lib/media";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { toast } from "sonner-native";

const IMAGE_GAP = 8;

export const CameraImage = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const router = useRouter();
  const { imageUri, setRemoveImageUri } = usePlanStore();

  const onRemoveImageUri = (id: number) => {
    setRemoveImageUri(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <AntDesign
            name="camera"
            size={20}
            color={themeColor.tintText}
            style={iconLine(20)}
          />
          <Text style={{ fontSize: 16 }}>{t("plan.photo")}</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tintText }]}>
          {t("common.optional")}
        </Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          // 카메라 권한은 카메라 화면이 열릴 때 그 화면에서 직접 요청한다
          if (imageUri.length === 4) {
            return toast.error(t("plan.photoMax"));
          }
          router.push("/add-plan/camera");
        }}
      >
        {t("plan.takePhoto")}
      </Button>
      <View style={styles.imageListContainer}>
        {imageRows(imageUri).map((row) => (
          <View key={row[0].id} style={styles.imageRow}>
            {row.map((item) => (
              <View style={styles.imageCell} key={item.id}>
                <Image
                  key={item.id}
                  source={{ uri: resolveMediaUri(item.imageUri) }}
                  contentFit="cover"
                  style={[
                    styles.image,
                    {
                      borderColor: themeColor.itemColor,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => onRemoveImageUri(item.id)}
                  style={[
                    styles.closeButton,
                    {
                      borderColor: themeColor.pressed,
                      backgroundColor: themeColor.background,
                    },
                  ]}
                >
                  {/* AntDesign close는 획이 가늘다 — 같은 X를 더 두껍게 그리는 아이콘 */}
                  <MaterialCommunityIcons
                    name="close-thick"
                    size={14}
                    color={themeColor.pressed}
                  />
                </TouchableOpacity>
              </View>
            ))}
            {/* 홀수 장의 마지막 줄도 반 칸 — 한 장일 때만 줄을 꽉 채운다 */}
            {imageUri.length > 1 && row.length === 1 && (
              <View style={styles.imageCell} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 10,
  },

  subText: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
    alignItems: "flex-end",
  },
  imageListContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: IMAGE_GAP,
  },
  imageRow: {
    flexDirection: "row",
    gap: IMAGE_GAP,
  },
  imageCell: {
    flex: 1,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  // 사진 위에 얹히므로 안을 배경색으로 채운다 — 투명하면 밝은 사진에서 X가 묻힌다
  closeButton: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.4,
    alignItems: "center",
    justifyContent: "center",
  },
});
