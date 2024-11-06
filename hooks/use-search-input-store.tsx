import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native"
import { create } from "zustand"

type SearchInputStoreProps = {
  inputValue: any
  setInputValue: (value: any) => void
}

export const useSearchInputStore = create<SearchInputStoreProps>((set) => ({
  inputValue: "",
  setInputValue: (value) =>
    set({
      inputValue: value,
    }),
}))
