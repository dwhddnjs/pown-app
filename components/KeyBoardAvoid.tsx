import { useEffect, useState } from "react"
import { KeyboardAvoidingView, NativeModules, Platform } from "react-native"
const { StatusBarManager } = NativeModules

export const KeyBoardAvoid = ({ children, aosOffset = 0, ...props }: any) => {
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarFrameData: any) => {
        setStatusBarHeight(statusBarFrameData.height)
      })
    }
  }, [])

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={
        Platform.OS === "ios" ? statusBarHeight : aosOffset
      }
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  )
}
