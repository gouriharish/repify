import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export default function Subjects() {
  const { COLORS } = useTheme();
  const { semesterId } = useLocalSearchParams<{ semesterId?: string }>();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [semester, setSemester] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    action?: () => void;
  } | null>(null);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: COLORS.text,
      letterSpacing: -0.3,
    },

    card: {
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    subjectName: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.text,
    },

    empty: {
      textAlign: "center",
      marginTop: 60,
      color: COLORS.muted,
      fontSize: 15,
    },
  });

  const load = async () => {
    setLoading(true);
    try {
      let semId = semesterId;

      if (!semId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("semester_id")
          .eq("id", user.id)
          .single();

        semId = profile?.semester_id ?? null;
      }

      if (!semId) {
        setSemester(null);
        setSubjects([]);
        return;
      }

      const { data: sem } = await supabase
        .from("semesters")
        .select("*")
        .eq("id", semId)
        .single();

      setSemester(sem);

      const { data: list } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", semId)
        .order("name");

      setSubjects(list ?? []);
    } catch (e: any) {
      setDialog({ title: "Error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [semesterId]));

  const deleteSubject = (id: string) => {
    setDialog({
      title: "Delete Subject",
      message: "Are you sure you want to delete this subject?",
      action: async () => {
        await supabase.from("subjects").delete().eq("id", id);
        load();
        setDialog(null);
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {semester ? semester.name : "No Active Semester"}
        </Text>

        {semester && (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/subjects/add", params: { sem_id: semester.id } })
            }
          >
            <Ionicons name="add" size={26} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </View>

      {!semester ? (
        <Text style={styles.empty}>Activate a semester to see subjects</Text>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No subjects added yet</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/subjects/[id]/assignments", params: { id: item.id } })
                }
              >
                <Text style={styles.subjectName}>{item.name}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteSubject(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {dialog && (
        <View style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}>
          <View style={{
            width: "100%",
            borderRadius: 26,
            backgroundColor: COLORS.card,
            padding: 26,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 18,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" }}>
              {dialog.title}
            </Text>

            <Text style={{ fontSize: 15, color: COLORS.muted, textAlign: "center", marginVertical: 20 }}>
              {dialog.message}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  backgroundColor: COLORS.border,
                }}
                onPress={() => setDialog(null)}
              >
                <Text style={{ color: COLORS.text, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              {dialog.action && (
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 14,
                    backgroundColor: COLORS.accent,
                  }}
                  onPress={dialog.action}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
