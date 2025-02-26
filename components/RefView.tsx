import React, { forwardRef } from "react"
// component
import { View, ViewProps } from "react-native"

export const RefView = forwardRef<View, ViewProps>((props, ref) => {
  return (
    <View ref={ref} {...props}>
      {props.children}
    </View>
  )
})
