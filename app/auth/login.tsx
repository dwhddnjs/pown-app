import React, { useState } from "react"
import { StyleSheet, TextInput } from "react-native"

import { Button, Input } from "@rneui/themed"
import { supabase } from "@/lib/supabase"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { Controller, useForm } from "react-hook-form"

export default function login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>PowPow</Text>
      </View>
      <View>
        <Text>로그인</Text>
        <View>
          <Text>email*</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="First name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="email"
          />
          {errors.email && <Text>This is required.</Text>}
        </View>
        <View>
          <Text>password*</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="First name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="password"
          />
          {errors.password && <Text>This is required.</Text>}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  titleContainer: {
    borderWidth: 1,
    borderColor: Colors.dark.text,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontFamily: "sb-b",
    fontSize: 32,
  },
})

// async function signInWithEmail() {
//   setLoading(true)
//   const { error } = await supabase.auth.signInWithPassword({
//     email: email,
//     password: password,
//   })

//   if (error) Alert.alert(error.message)
//   setLoading(false)
// }

// async function signUpWithEmail() {
//   setLoading(true)
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.signUp({
//     email: email,
//     password: password,
//   })

//   if (error) Alert.alert(error.message)
//   if (!session) Alert.alert("Please check your inbox for email verification!")
//   setLoading(false)
// }
