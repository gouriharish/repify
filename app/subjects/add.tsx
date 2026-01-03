import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export default function AddSubject() {
  const { COLORS } = useTheme();
  const { sem_id } = useLocalSearchParams<{ sem_id?: string }>();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{
    title: string;
    subject?: string;
    error?: string;
  } | null>(null);

  const save = async () => {
    if (!name.trim()) {
      return setDialog({ title: "Error", error: "Please enter subject name." });
    }

    setLoading(true);
    try {
      let semesterId = sem_id;

      if (!semesterId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in");

        const { data: profile } = await supabase
          .from("profiles")
          .select("semester_id")
          .eq("id", user.id)
          .single();

        semesterId = profile?.semester_id ?? null;
      }

      if (!semesterId)
        throw new Error("No semester selected. Activate or open a semester first.");

      const { error } = await supabase.from("subjects").insert({
        name: name.trim(),
        semester_id: semesterId,
      });

      if (error) throw error;

      setDialog({ title: "Success ", subject: name.trim() });
      setName("");
    } catch (err: any) {
      setDialog({ title: "Error", error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 24 },

   headerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 36,
  gap: 12,
  paddingTop:25,     // 👈 pushes it below the notch
},


    title: {
      fontSize: 32,
      fontWeight: "900",
      color: COLORS.text,
    },

    input: {
      backgroundColor: COLORS.card,
      padding: 16,
      borderRadius: 16,
      fontSize: 16,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    button: {
      marginTop: 24,
      backgroundColor: COLORS.accent,
      padding: 18,
      borderRadius: 16,
      alignItems: "center",
    },

    btnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>New Subject</Text>
      </View>

      <TextInput
        placeholder="e.g. DBMS"
        placeholderTextColor={COLORS.muted}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={save} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Save</Text>
        )}
      </TouchableOpacity>

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

            {dialog.subject && (
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: COLORS.text,
                  textAlign: "center",
                  marginVertical: 14,
                }}
              >
                {dialog.subject}
              </Text>
            )}

            <Text
              style={{
                fontSize: 15,
                color: COLORS.muted,
                textAlign: "center",
                marginBottom: 22,
              }}
            >
              {dialog.subject ? "added successfully." : dialog.error}
            </Text>

            <TouchableOpacity
              style={{
                alignSelf: "center",
                backgroundColor: COLORS.accent,
                paddingVertical: 10,
                paddingHorizontal: 22,
                borderRadius: 14,
              }}
              onPress={() => {
                setDialog(null);
                router.back();
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
