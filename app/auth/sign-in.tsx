import React, { useState } from "react"
import { StyleSheet, TextInput, TouchableOpacity } from "react-native"
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin"
import Logo from "@/assets/images/svg/pow_logo.svg"
import Logo2 from "@/assets/images/svg/pow_logo2.svg"

import { supabase } from "@/lib/supabase"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/Button"

export default function SignIn() {
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
        <Logo2 />

        <Text style={styles.title}>Sign In.</Text>
        <Logo />
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.textInputContainer}>
          <Text>Email*</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="email을 입력해주세요"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="email"
          />
          {errors.email && <Text>이메일을 입력해주세요</Text>}
        </View>
        <View style={styles.textInputContainer}>
          <Text>Password*</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="비밀번호를 입력해주세요"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="password"
          />
          {errors.password && <Text>비밀번호를 입력해주세요</Text>}
        </View>
      </View>
      <Button type="solid">로그인</Button>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.or}>OR</Text>
        <View style={styles.divider} />
      </View>

      <View>
        {/* <TouchableOpacity></TouchableOpacity>
        <TouchableOpacity></TouchableOpacity> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 24,
  },

  contentWrapper: {
    paddingHorizontal: 24,
  },

  login: {
    fontSize: 18,
    fontFamily: "sb-b",
  },

  titleContainer: {
    // borderWidth: 1,
    // borderColor: Colors.dark.text,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontFamily: "sb-b",
    fontSize: 32,
    color: Colors.dark.tint,
  },

  input: {
    // borderWidth: 1,
    // borderColor: Colors.dark.background,
    backgroundColor: Colors.dark.itemColor,
    fontFamily: "sb-l",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  textInputContainer: {
    gap: 2,
  },
  textInput: {
    color: Colors.dark.subText,
  },

  dividerContainer: {
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  divider: {
    backgroundColor: Colors.dark.subText,
    height: 1,
    width: 150,
  },

  or: {
    textAlign: "center",
    color: Colors.dark.subText,
    fontFamily: "sb-l",
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
