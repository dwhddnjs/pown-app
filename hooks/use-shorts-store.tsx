import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ShortsVideoTypes = {
  id: number
  thumbnail: string
  video: string
}

type ShortsStoreTypes = {
  videos: ShortsVideoTypes[]
  setAddVideo: (video: ShortsVideoTypes) => void
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
    }),
    {
      name: "shorts",
      storage: createJSONStorage(() => storage),
    }
  )
)
