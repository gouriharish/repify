import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function MarkSubmissions() {
  const router = useRouter();
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const { COLORS } = useTheme();

  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) load();
  }, [assignmentId]);

  const load = async () => {
    try {
      // Fetch all students
      const { data: studentList } = await supabase
        .from("students")
        .select("*")
        .order("roll_no");

      // Fetch submissions for this assignment
      const { data: submissionList } = await supabase
        .from("submissions")
        .select("student_id, submitted")
        .eq("assignment_id", assignmentId);

      const map: Record<string, boolean> = {};
      submissionList?.forEach((s) => {
        map[s.student_id] = s.submitted;
      });

      setStudents(studentList ?? []);
      setSubmissions(map);
    } catch (e) {
      console.error("Load submissions error:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmission = async (studentId: string) => {
    const current = submissions[studentId] ?? false;
    const next = !current;

    setSubmissions((prev) => ({
      ...prev,
      [studentId]: next
    }));

    await supabase
  .from("submissions")
  .upsert(
    {
      student_id: studentId,
      assignment_id: assignmentId,
      submitted: next,
      submission_date: next ? new Date().toISOString() : null
    },
    {
      onConflict: "student_id,assignment_id"
    }
  );

  };


  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Mark Submissions
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const submitted = submissions[item.id] ?? false;

          return (
            <View
              style={[
                styles.row,
                { backgroundColor: COLORS.card, borderColor: COLORS.border }
              ]}
            >
              <View>
                <Text style={[styles.name, { color: COLORS.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.roll, { color: COLORS.muted }]}>
                  Roll No: {item.roll_no}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: submitted ? "#22c55e" : "#ef4444"
                  }
                ]}
                onPress={() => toggleSubmission(item.id)}
              >
                <Text style={styles.statusText}>
                  {submitted ? "Submitted" : "Not Submitted"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  row: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  name: {
    fontSize: 16,
    fontWeight: "600"
  },

  roll: {
    fontSize: 13,
    marginTop: 4
  },

  statusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12
  },

  statusText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13
  }
});
