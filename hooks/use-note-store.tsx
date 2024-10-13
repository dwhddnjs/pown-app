import { create } from "zustand"

type NoteStoreType = {
  title: string
  content: string
  setValue: (type: string, value: string) => void
}

export const useNoteStore = create<NoteStoreType>((set) => ({
  title: "",
  content: "",
  setValue: (type, value) =>
    set({
      [type]: value,
    }),
}))