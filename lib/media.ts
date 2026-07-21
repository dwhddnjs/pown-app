import { tt } from "@/hooks/use-t"
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import { toast } from "sonner-native"
import { ImageUriType } from "@/hooks/use-plan-store"

export const MEDIA_DIR = "media/"

// documentDirectory 절대경로는 앱 재설치·복원마다 바뀐다 —
// 앱 소유 미디어는 "media/<파일명>" 상대경로로 저장하고 렌더 시점에 해석한다
export const ensureMediaDir = async () => {
  const dir = FileSystem.documentDirectory + MEDIA_DIR
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
  return dir
}

// 사진첩·캐시의 소스를 앱 내부 저장소로 복사하고 상대경로를 돌려준다
export const persistMediaLocally = async (
  sourceUri: string,
  fileName: string,
) => {
  const dir = await ensureMediaDir()
  await FileSystem.copyAsync({ from: sourceUri, to: dir + fileName })
  return MEDIA_DIR + fileName
}

export const isAppOwnedMedia = (stored?: string): stored is string =>
  !!stored?.startsWith(MEDIA_DIR)

// 상대경로면 현재 documentDirectory를 붙이고, 구 데이터(절대 file://·ph://)는 그대로 통과
export const resolveMediaUri = <T extends string | undefined>(stored: T): T =>
  (isAppOwnedMedia(stored)
    ? FileSystem.documentDirectory + stored
    : stored) as T

const isAppOwned = (item: ImageUriType) => isAppOwnedMedia(item.imageUri)

// 촬영한 임시 사진(캐시 경로)을 앱 내부 저장소로 복사해 상대경로로 바꿔 돌려준다.
// 사진첩 저장은 best-effort — 권한이 없어도 앱 안에서는 사진이 유지된다.
export const saveImagesToLibrary = async (
  images: ImageUriType[],
): Promise<ImageUriType[]> => {
  const newImages = images.filter((item) => !isAppOwned(item))

  if (newImages.length === 0) {
    return images
  }

  // 갓 촬영한 캐시 사진만 사진첩에 저장한다 — 이미 사진첩에 있는 구 데이터를 중복 저장하지 않도록
  const hasFreshCapture = newImages.some((item) =>
    item.imageUri?.startsWith(FileSystem.cacheDirectory as string),
  )
  const status = hasFreshCapture
    ? (await MediaLibrary.requestPermissionsAsync()).status
    : "denied"
  if (hasFreshCapture && status !== "granted") {
    toast.error(tt("camera.libraryPermission"))
  }

  const saved = await Promise.all(
    newImages.map(async (item) => {
      let source = item.imageUri as string
      if (status === "granted" && source.startsWith(FileSystem.cacheDirectory as string)) {
        try {
          const asset = await MediaLibrary.createAssetAsync(source)
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
          source = assetInfo.localUri ?? source
        } catch {
          // 사진첩 저장 실패해도 원본 캐시로 앱 소유 복사는 계속한다
        }
      }
      try {
        return {
          id: item.id,
          imageUri: await persistMediaLocally(
            source,
            `plan-img-${item.id}.jpg`,
          ),
        }
      } catch {
        return { id: item.id, imageUri: source }
      }
    }),
  )

  // 원본 순서 유지 — 수정 후 저장할 때 사진 순서가 뒤바뀌지 않도록
  const savedById = new Map(saved.map((item) => [item.id, item]))
  return images.map((item) => savedById.get(item.id) ?? item)
}

// 저장은 항상 kg 기준 — lb 입력이면 kg으로 변환(소수 1자리 반올림)
export const convertWeightToKg = (weight: string, weightType: "kg" | "lb") =>
  weightType === "lb"
    ? (Math.round((parseFloat(weight) / 2.20462) * 10) / 10).toString()
    : weight
