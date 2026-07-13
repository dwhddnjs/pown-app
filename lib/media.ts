import * as MediaLibrary from "expo-media-library"
import { toast } from "sonner-native"
import { ImageUriType } from "@/hooks/use-plan-store"

// 사진 앱에 이미 저장된 사진은 localUri가 /DCIM/ 경로다 — 재저장하지 않고 그대로 유지한다
const isSavedInLibrary = (item: ImageUriType) =>
  item.imageUri?.includes("/DCIM/")

// 촬영한 임시 사진(캐시 경로)을 사진 앱에 저장하고 영구 경로(localUri)로 바꿔 돌려준다.
// 권한은 저장하는 이 시점에 요청하고, 거부되면 사진 없이 진행한다(토스트로 안내).
export const saveImagesToLibrary = async (
  images: ImageUriType[],
): Promise<ImageUriType[]> => {
  const alreadySaved = images.filter(isSavedInLibrary)
  const newImages = images.filter((item) => !isSavedInLibrary(item))

  if (newImages.length === 0) {
    return alreadySaved
  }

  const { status } = await MediaLibrary.requestPermissionsAsync()
  if (status !== "granted") {
    toast.error("사진 보관함 권한이 없어 사진은 저장되지 않아요.")
    return alreadySaved
  }

  const saved = await Promise.all(
    newImages.map(async (item) => {
      const asset = await MediaLibrary.createAssetAsync(
        item.imageUri as string,
      )
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
      return {
        id: item.id,
        imageUri: assetInfo.localUri,
      }
    }),
  )

  return [...alreadySaved, ...saved]
}

// 저장은 항상 kg 기준 — lb 입력이면 kg으로 변환(소수 1자리 반올림)
export const convertWeightToKg = (weight: string, weightType: "kg" | "lb") =>
  weightType === "lb"
    ? (Math.round((parseFloat(weight) / 2.20462) * 10) / 10).toString()
    : weight
