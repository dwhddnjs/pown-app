import { removeAppOwnedMedia } from "@/lib/media"
import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ShortsVideoTypes = {
  id: number
  thumbnail: string
  video: string
  createdAt: string
  title?: string
  content?: string
}

type ShortsStoreTypes = {
  videos: ShortsVideoTypes[]
  setAddVideo: (video: ShortsVideoTypes) => void
  setMemo: (videoId: number, memo: { title: string; content: string }) => void
  setRemoveVideo: (videoId: number) => void
  onSetVideos: (videos: ShortsVideoTypes[]) => void
  onResetVideo: () => void
}

export const useShortsStore = create<ShortsStoreTypes>()(
  persist(
    (set, get) => ({
      videos: [],
      setAddVideo: (video) =>
        set((prev) => ({
          ...prev,
          videos: [...prev.videos, video],
        })),
      setMemo: (videoId, memo) =>
        set((prev) => {
          const index = prev.videos.findIndex((item) => item.id === videoId)
          if (index === -1) return prev
          const videos = [...prev.videos]
          videos[index] = { ...videos[index], ...memo }
          return { ...prev, videos }
        }),
      setRemoveVideo: (videoId) => {
        const target = get().videos.find((item) => item.id === videoId)
        removeAppOwnedMedia(target?.video)
        removeAppOwnedMedia(target?.thumbnail)
        set((prev) => ({
          ...prev,
          videos: prev.videos.filter((item) => item.id !== videoId),
        }))
      },
      onSetVideos: (videos) => set({ videos }),
      onResetVideo: () => {
        get().videos.forEach((video) => {
          removeAppOwnedMedia(video.video)
          removeAppOwnedMedia(video.thumbnail)
        })
        set({
          videos: [],
        })
      },
    }),
    {
      name: "shorts",
      storage: createJSONStorage(() => storage),
    }
  )
)
