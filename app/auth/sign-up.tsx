import React, { useState } from "react"
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin"
import { supabase } from "@/lib/supabase"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/Button"
import { Link } from "expo-router"
import Logo from "@/assets/images/svg/pow_logo.svg"
import { useSignUpMutation } from "@/hooks/mutation/user"

export default function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })
  const { mutate } = useSignUpMutation()

  const onSubmit = (formData: any) => {
    mutate(formData)
  }

  return (
    <ScrollView style={styles.container}>
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
                placeholder="이메일을 입력해주세요"
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
          <Text>Name*</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="이름을 입력해주세요"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="name"
          />
          {errors.name && <Text>이메일을 입력해주세요</Text>}
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
      <View style={styles.signinup}>
        <Button type="solid" onPress={handleSubmit(onSubmit)}>
          회원가입
        </Button>
        <Link href="/auth/sign-in" style={styles.link}>
          이미 가입한 계정이 있으신가요?
        </Link>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  contentWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },

  socialText: {
    // textAlign: "center",
    color: Colors.light.text,
    fontFamily: "sb-b",
    // fontSize: 16,
  },

  login: {
    fontSize: 18,
    fontFamily: "sb-b",
  },

  titleContainer: {
    // borderWidth: 1,
    // borderColor: Colors.dark.text,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontFamily: "sb-b",
    fontSize: 28,
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
    color: Colors.dark.text,
  },
  textInputContainer: {
    gap: 8,
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
    paddingVertical: 12,
  },

  link: {
    color: Colors.dark.tint,
    fontFamily: "sb-l",
    textAlign: "center",
  },
  signinup: {
    // borderWidth: 1,
    justifyContent: "center",
    gap: 14,
  },
  socialContainer: {
    gap: 10,
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
