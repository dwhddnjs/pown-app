import { create } from "zustand"

type ImageUriType = {
  id: number
  uri: string
}

type ImageUriStoreType = {
  uri: ImageUriType[]
  setImageUri: (uri: ImageUriType) => void
  setRemoveImageUri: (id: number) => void
}

export const useImageUriStore = create<ImageUriStoreType>((set) => ({
  uri: [],
  setImageUri: (uri) =>
    set((prev) => ({
      uri: [...prev.uri, uri],
    })),

  setRemoveImageUri: (id) =>
    set((prev) => ({
      uri: prev.uri.filter((item) => item.id !== id),
    })),

  onResetImageUri: () =>
    set({
      uri: [],
    }),
}))
