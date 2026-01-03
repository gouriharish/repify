import { router } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from "./context/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Theme context
  const { dark, toggleTheme, anim, COLORS } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        alert(error.message);
        return;
      }

      // For now, allow everyone to enter home (CR restriction comes later)
      router.replace("/(tabs)/home");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 28
    },
    header: {
      fontSize: 34,
      color: COLORS.text,
      fontWeight: "800",
      letterSpacing: -1
    },
    sub: {
      color: COLORS.muted,
      fontSize: 16,
      marginBottom: 28
    },
    input: {
      backgroundColor: COLORS.card,
      color: COLORS.text,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border
    },
    btn: {
      backgroundColor: "#22C55E",   // green only for login

      padding: 18,
      borderRadius: 14,
      marginTop: 6,
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      opacity: loading ? 0.7 : 1
    },
    btnText: {
      color: dark ? "#052E16" : "#FFFFFF",
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700"
    },
    link: { marginTop: 20 },
    linkText: {
      color: COLORS.primary,
      textAlign: "center",
      fontWeight: "700"
    },
    toggleBox: {
      position: "absolute",
      top: 60,
      right: 28,
      zIndex: 10
    },
    toggleTrack: {
      width: 50,
      height: 28,
      borderRadius: 14,
      backgroundColor: dark ? "#1E293B" : "#E2E8F0",
      padding: 4,
      justifyContent: "center"
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: dark ? "#22C55E" : "#F59E0B",
      alignItems: "center",
      justifyContent: "center"
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Theme Toggle */}
          <View style={styles.toggleBox}>
            <Pressable onPress={toggleTheme}>
              <View style={styles.toggleTrack}>
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [
                        {
                          translateX: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 22]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  {dark ? (
                    <Moon size={12} color="#052E16" fill="#052E16" />
                  ) : (
                    <Sun size={12} color="#FFFFFF" />
                  )}
                </Animated.View>
              </View>
            </Pressable>
          </View>

          <Text style={styles.header}>Login</Text>
          <Text style={styles.sub}>Please sign in to continue</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={dark ? "#052E16" : "#FFFFFF"} />
            ) : (
              <Text style={styles.btnText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.linkText}>New user? Create Account</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
