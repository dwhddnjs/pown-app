import { removeAppOwnedMedia } from "@/lib/media"
import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ShortsVideoTypes = {
  id: number
  thumbnail: string
  video: string
  createdAt: string
}

type ShortsStoreTypes = {
  videos: ShortsVideoTypes[]
  setAddVideo: (video: ShortsVideoTypes) => void
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
