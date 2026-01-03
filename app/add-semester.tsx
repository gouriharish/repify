import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from "./context/ThemeContext";

export default function AddSemester() {
  const { COLORS } = useTheme();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);

  const saveSem = async () => {
    if (!name)
      return setDialog({ title: "Missing Name", message: "Please enter a semester name." });

    setLoading(true);
    try {
      const { error } = await supabase
        .from("semesters")
        .insert([{ name, is_active: false }]);

      if (error) throw error;

      setDialog({
        title: "Semester Added",
        message: name,
      });
    } catch (error: any) {
      setDialog({ title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, flex: 1, justifyContent: "center" },
    backBtn: { position: "absolute", top: 50, left: 24 },

    form: { marginBottom: 30 },

    input: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 18,
      fontSize: 16,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    button: {
      backgroundColor: COLORS.accent,
      padding: 18,
      borderRadius: 16,
      elevation: 5,
      alignItems: "center",
    },
   title: {
  fontSize: 30,
  fontWeight: "700",
  color: COLORS.text,
  textAlign: "center",
  marginBottom: 36,
  letterSpacing: -0.4,
},

label: {
  fontSize: 13,
  fontWeight: "500",
  color: COLORS.muted,
  marginBottom: 6,
  marginLeft: 4,
},

buttonText: {
  color: "#fff",
  fontSize: 17,
  fontWeight: "600",
  letterSpacing: 0.2,
},

  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>New Semester</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Semester Name</Text>
          <TextInput
            placeholder="e.g. S4 CSE"
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={saveSem} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Semester</Text>}
        </TouchableOpacity>
      </View>

      {/* Premium Dialog */}
      {dialog && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              borderRadius: 26,
              backgroundColor: COLORS.card,
              padding: 26,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 30,
              elevation: 18,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" }}>
              {dialog.title}
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: COLORS.text,
                textAlign: "center",
                marginVertical: 16,
              }}
            >
              {dialog.message}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 14,
                  backgroundColor: COLORS.accent,
                }}
                onPress={() => {
                  setDialog(null);
                  router.replace("/semesters");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Go to Semesters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
