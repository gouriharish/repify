import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from "./context/ThemeContext";

export default function Semesters() {
  const { COLORS } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    action?: () => void;
  } | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("semesters")
      .select("*")
      .order("name", { ascending: true });

    setData(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const activateSem = async (id: string, name: string, isActive: boolean) => {
    if (isActive) return;

    setData((prev) => prev.map((s) => ({ ...s, is_active: s.id === id })));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      await supabase.from("semesters").update({ is_active: false }).neq("id", id);
      await supabase.from("semesters").update({ is_active: true }).eq("id", id);
      await supabase.from("profiles").update({ semester_id: id }).eq("id", user.id);

      setDialog({ title: "Semester Activated 🎓", message: name });
    } catch (err: any) {
      setDialog({ title: "Error", message: err.message });
      load();
    }
  };

  const deleteSemester = async (id: string, isActive: boolean) => {
    if (isActive)
      return setDialog({
        title: "Not allowed",
        message: "You cannot delete the active semester.",
      });

    const { data: subjects } = await supabase
      .from("subjects")
      .select("id")
      .eq("semester_id", id)
      .limit(1);

    if (subjects?.length)
      return setDialog({
        title: "Cannot delete",
        message: "This semester has subjects.",
      });

    setDialog({
      title: "Delete Semester",
      message: "Are you sure you want to delete this semester?",
      action: async () => {
        await supabase.from("semesters").delete().eq("id", id);
        load();
        setDialog(null);
      },
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 50,
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    emptyText: { textAlign: "center", color: COLORS.muted, marginTop: 30 },

    semCard: {
      padding: 22,
      borderRadius: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 22,
      backgroundColor: COLORS.card,
      shadowColor: COLORS.text,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    semValue: {
  fontSize: 20,
  fontWeight: "800",
  color: COLORS.text,
  letterSpacing: -0.3,
  marginBottom: 4,
},

    badge: {
      fontSize: 11,
      fontWeight: "800",
      color: COLORS.accent,
    },

    openBtn: {
      height: 36,
      minWidth: 64,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.accent,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 14,
    },
    openText: { color: COLORS.accent, fontWeight: "700" },

    activateBtn: {
      height: 36,
      minWidth: 74,
      borderRadius: 10,
      backgroundColor: COLORS.accent,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 14,
    },
    activateText: { color: "#fff", fontWeight: "700" },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manage Semesters</Text>

        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/add-semester")}>
          <Ionicons name="add" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No semesters added yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.semCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.semValue}>{item.name}</Text>
              {item.is_active && <Text style={styles.badge}>ACTIVE</Text>}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() =>
                  router.push({ pathname: "/subjects", params: { semesterId: item.id } })
                }
              >
                <Text style={styles.openText}>Open</Text>
              </TouchableOpacity>

              {!item.is_active && (
                <TouchableOpacity
                  style={styles.activateBtn}
                  onPress={() => activateSem(item.id, item.name, item.is_active)}
                >
                  <Text style={styles.activateText}>Activate</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => deleteSemester(item.id, item.is_active)}
                disabled={item.is_active}
                style={{ opacity: item.is_active ? 0.4 : 1 }}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

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
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: COLORS.text,
                textAlign: "center",
              }}
            >
              {dialog.title}
            </Text>

            {dialog.title.includes("Activated") ? (
              <>
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
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.muted,
                    textAlign: "center",
                    marginBottom: 22,
                  }}
                >
                  is now your active semester
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 15, color: COLORS.muted, marginVertical: 20 }}>
                {dialog.message}
              </Text>
            )}

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
