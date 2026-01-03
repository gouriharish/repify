import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from "./context/ThemeContext";

export default function SelectSemester() {
  const { dark, COLORS } = useTheme();

  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSemesters(); }, []);

  const loadSemesters = async () => {
    const { data } = await supabase.from("semesters").select("id, name");
    setSemesters(data || []);
    setLoading(false);
  };

  const select = async (id: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({ semester_id: id }).eq("id", user.id);
      await supabase.from("semesters").update({ is_active: false }).neq("id", id);
      await supabase.from("semesters").update({ is_active: true }).eq("id", id);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 30, justifyContent: "center", flexGrow: 1 },

    title: {
      fontSize: 32,
      fontWeight: "800",
      textAlign: "center",
      color: COLORS.text
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: COLORS.muted,
      marginBottom: 40,
      marginTop: 10
    },
    semBtn: {
      padding: 20,
      backgroundColor: COLORS.accent,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15
    },
    txt: {
      color: dark ? "#052E16" : "#FFFFFF",
      fontSize: 18,
      fontWeight: "700"
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome! 🎓</Text>
        <Text style={styles.subtitle}>Select your semester to continue.</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} />
        ) : (
          semesters.map(s => (
            <TouchableOpacity
              key={s.id}
              style={styles.semBtn}
              onPress={() => select(s.id)}
            >
              <Text style={styles.txt}>{s.name}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={dark ? "#052E16" : "#FFFFFF"}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
