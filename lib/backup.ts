import { tt } from "@/hooks/use-t"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useShortsStore } from "@/hooks/use-shorts-store"
// lib
import { ensureMediaDir, MEDIA_DIR, resolveMediaUri } from "@/lib/media"
// expo
import * as FileSystem from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"
import { shareAsync, isAvailableAsync } from "expo-sharing"
import { zip, unzip } from "react-native-zip-archive"
import { toast } from "sonner-native"

// react-native-zip-archive는 file:// 스킴이 아닌 순수 경로를 받는다
const toPath = (uri: string) => uri.replace("file://", "")

const BACKUP_NAME = "pown-backup.pown"

type Manifest = {
  version: number
  exportedAt: string
  stores: {
    user: Pick<
      ReturnType<typeof useUserStore.getState>,
      "userInfo" | "workoutList" | "theme"
    >
    workoutPlan: Pick<
      ReturnType<typeof useWorkoutPlanStore.getState>,
      "workoutPlanList"
    >
    shorts: Pick<ReturnType<typeof useShortsStore.getState>, "videos">
  }
}

const rmrf = (uri: string) =>
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})

// 미디어를 스테이징 media/ 로 복사하고 아카이브 내 상대경로를 돌려준다.
// 사진첩 참조(ph://)나 이미 사라진 파일은 담을 게 없어 스킵(undefined).
const bundleMedia = async (stagingMediaDir: string, stored?: string) => {
  if (!stored || stored.startsWith("ph://")) return undefined
  const source = resolveMediaUri(stored)
  const fileName = source.split("/").pop() as string
  try {
    const info = await FileSystem.getInfoAsync(source)
    if (!info.exists) return undefined
    await FileSystem.copyAsync({ from: source, to: stagingMediaDir + fileName })
    return MEDIA_DIR + fileName
  } catch {
    return undefined
  }
}

export const createBackup = async () => {
  const staging = `${FileSystem.cacheDirectory}pown-backup/`
  const archive = `${FileSystem.cacheDirectory}${BACKUP_NAME}`

  try {
    if (!(await isAvailableAsync())) {
      toast.error(tt("data.shareUnavailable"))
      return false
    }

    await rmrf(staging)
    await rmrf(archive)
    const stagingMediaDir = staging + MEDIA_DIR
    await FileSystem.makeDirectoryAsync(stagingMediaDir, {
      intermediates: true,
    })

    const { userInfo, workoutList, theme } = useUserStore.getState()
    const { workoutPlanList } = useWorkoutPlanStore.getState()
    const { videos } = useShortsStore.getState()

    const bundledPlans = await Promise.all(
      workoutPlanList.map(async (plan) => ({
        ...plan,
        imageUri: await Promise.all(
          (plan.imageUri || []).map(async (image) => ({
            ...image,
            imageUri: await bundleMedia(stagingMediaDir, image.imageUri),
          })),
        ),
      })),
    )

    const bundledVideos = await Promise.all(
      videos.map(async (video) => ({
        ...video,
        video: (await bundleMedia(stagingMediaDir, video.video)) ?? video.video,
        thumbnail:
          (await bundleMedia(stagingMediaDir, video.thumbnail)) ??
          video.thumbnail,
      })),
    )

    const manifest: Manifest = {
      version: 1,
      exportedAt: new Date().toISOString(),
      stores: {
        user: { userInfo, workoutList, theme },
        workoutPlan: { workoutPlanList: bundledPlans },
        shorts: { videos: bundledVideos },
      },
    }

    await FileSystem.writeAsStringAsync(
      staging + "manifest.json",
      JSON.stringify(manifest),
      { encoding: FileSystem.EncodingType.UTF8 },
    )

    await zip(toPath(staging), toPath(archive))
    await shareAsync(archive, { mimeType: "application/zip" })
    return true
  } catch {
    toast.error(tt("data.backupFailed"))
    return false
  } finally {
    await rmrf(staging)
  }
}

const isValidManifest = (value: any): value is Manifest =>
  !!value &&
  typeof value.version === "number" &&
  !!value.stores &&
  Array.isArray(value.stores.user?.userInfo) &&
  Array.isArray(value.stores.workoutPlan?.workoutPlanList) &&
  Array.isArray(value.stores.shorts?.videos)

export const restoreBackup = async () => {
  const extracted = `${FileSystem.cacheDirectory}pown-restore/`

  try {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" })
    const picked = result.assets?.[0]?.uri
    if (!picked) return false

    await rmrf(extracted)
    await FileSystem.makeDirectoryAsync(extracted, { intermediates: true })
    await unzip(toPath(picked), toPath(extracted))

    const raw = await FileSystem.readAsStringAsync(extracted + "manifest.json", {
      encoding: FileSystem.EncodingType.UTF8,
    })
    const manifest = JSON.parse(raw)
    if (!isValidManifest(manifest)) {
      toast.error(tt("data.notBackupFile"))
      return false
    }

    // 아카이브의 media/* 를 앱 내부 저장소로 옮긴다 (상대경로 그대로 유효해짐)
    const mediaDir = await ensureMediaDir()
    const archiveMedia = extracted + MEDIA_DIR
    if ((await FileSystem.getInfoAsync(archiveMedia)).exists) {
      const files = await FileSystem.readDirectoryAsync(archiveMedia)
      for (const file of files) {
        await rmrf(mediaDir + file)
        await FileSystem.copyAsync({
          from: archiveMedia + file,
          to: mediaDir + file,
        })
      }
    }

    const { user, workoutPlan, shorts } = manifest.stores
    const { setUser } = useUserStore.getState()
    setUser("userInfo", user.userInfo)
    if (user.workoutList) setUser("workoutList", user.workoutList)
    if (user.theme) setUser("theme", user.theme)
    useWorkoutPlanStore.getState().onSetMockout(workoutPlan.workoutPlanList)
    useShortsStore.getState().onSetVideos(shorts.videos)

    toast.success(tt("data.restored"))
    return true
  } catch {
    toast.error(tt("data.restoreFailed"))
    return false
  } finally {
    await rmrf(extracted)
  }
}
