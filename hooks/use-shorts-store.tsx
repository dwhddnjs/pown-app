import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ShortsVideoTypes = {
  id: number
  thumbnail: string
  video: string
  createdAt: Date
}

type ShortsStoreTypes = {
  videos: ShortsVideoTypes[]
  setAddVideo: (video: ShortsVideoTypes) => void
  setRemoveVideo: (videoId: number) => void
  onResetVideo: () => void
}

export const useShortsStore = create<ShortsStoreTypes>()(
  persist(
    (set) => ({
      videos: [],
      setAddVideo: (video) =>
        set((prev) => ({
          ...prev,
          videos: [...prev.videos, video],
        })),
      setRemoveVideo: (videoId) =>
        set((prev) => ({
          ...prev,
          videos: [...prev.videos].filter((item) => item.id !== videoId),
        })),
      onResetVideo: () =>
        set({
          videos: [],
        }),
    }),
    {
      name: "shorts",
      storage: createJSONStorage(() => storage),
    }
  )
)
