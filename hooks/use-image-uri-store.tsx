import { create } from "zustand"

type ImageUriStoreType = {
  uri: string
  setImageUri: (uri: string) => void
  onResetImageUri: () => void
}

export const useImageUriStore = create<ImageUriStoreType>((set) => ({
  uri: "",
  setImageUri: (uri) =>
    set({
      uri: uri,
    }),
  onResetImageUri: () =>
    set({
      uri: "",
    }),
}))
