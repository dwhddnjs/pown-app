import { create } from "zustand"

type ImageUriType = {
  id: number
  uri: string
}

type ImageUriStoreType = {
  uri: ImageUriType[]
  setImageUri: (uri: ImageUriType) => void
}

export const useImageUriStore = create<ImageUriStoreType>((set) => ({
  uri: [],
  setImageUri: (uri) =>
    set((prev) => ({
      uri: [...prev.uri, uri],
    })),

  onResetImageUri: () =>
    set({
      uri: [],
    }),
}))
