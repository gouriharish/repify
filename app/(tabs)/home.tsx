import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { COLORS } = useTheme();

  const [profile, setProfile] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1️⃣ Profile + active semester id
      const { data: prof } = await supabase
        .from("profiles")
        .select("name, semester_id")
        .eq("id", user.id)
        .single();

      setProfile(prof);

      if (!prof?.semester_id) {
        setSemester(null);
        setSubjects([]);
        return;
      }

      // 2️⃣ Semester info
      const { data: sem } = await supabase
        .from("semesters")
        .select("*")
        .eq("id", prof.semester_id)
        .single();

      setSemester(sem);

      // 3️⃣ Subjects
      const { data: subs } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", prof.semester_id)
        .order("name");

      setSubjects(subs ?? []);
    } catch (err) {
      console.error("Home load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ reload whenever Home gains focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: COLORS.muted }]}>
              Welcome back,
            </Text>
            <Text style={[styles.name, { color: COLORS.text }]}>
              {profile?.name ?? "CR"}
            </Text>
          </View>

         <TouchableOpacity
  style={[
    styles.iconBtn,
    { backgroundColor: COLORS.card, borderColor: COLORS.border },
  ]}
  onPress={() => router.push("/profile")}
>
  <Ionicons
    name="person-outline"
    size={22}
    color={COLORS.primary}
  />
</TouchableOpacity>

        </View>

        {/* Semester */}
        <View
          style={[
            styles.semCard,
            { backgroundColor: COLORS.card, borderColor: COLORS.border },
          ]}
        >
          <View>
            <Text style={[styles.semLabel, { color: COLORS.muted }]}>
              Current Semester
            </Text>
            <Text style={[styles.semValue, { color: COLORS.text }]}>
              {semester?.name ?? "No Active Semester"}
            </Text>
          </View>
          <Ionicons name="school-outline" size={28} color={COLORS.primary} />
        </View>

        {/* Subjects */}
        <Text style={[styles.section, { color: COLORS.text }]}>Subjects</Text>

        {subjects.length === 0 ? (
          <Text style={[styles.emptyText, { color: COLORS.muted }]}>
            {semester
              ? "No subjects added for this semester"
              : "Activate a semester to see subjects"}
          </Text>
        ) : (
          <View style={styles.grid}>
            {subjects.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectCard,
                  { backgroundColor: COLORS.card, borderColor: COLORS.border },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/subjects/[id]/assignments",
                    params: { id: sub.id },
                  })
                }
              >
                <View style={styles.subjectIcon}>
                  <Ionicons name="book-outline" size={22} color="#6366f1" />
                </View>
                <Text
                  style={[styles.subjectText, { color: COLORS.text }]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: { fontSize: 16 },
  name: { fontSize: 28, fontWeight: "bold" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  semCard: {
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    borderWidth: 1,
  },
  semLabel: { fontSize: 14 },
  semValue: { fontSize: 20, fontWeight: "bold" },

  section: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  subjectCard: {
    width: "47%",
    height: 110,
    borderRadius: 18,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
  },

  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(99,102,241,0.15)",
  },

  subjectText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
});
