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

export default function ViewSubmissions() {
  const router = useRouter();
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const { COLORS } = useTheme();

  const [submitted, setSubmitted] = useState<any[]>([]);
  const [notSubmitted, setNotSubmitted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) load();
  }, [assignmentId]);

  const load = async () => {
    try {
      const { data: students } = await supabase
        .from("students")
        .select("*")
        .order("roll_no");

      const { data: submissions } = await supabase
        .from("submissions")
        .select("student_id, submitted")
        .eq("assignment_id", assignmentId);

      const submittedSet = new Set(
        submissions?.filter(s => s.submitted).map(s => s.student_id)
      );

      const submittedList: any[] = [];
      const notSubmittedList: any[] = [];

      students?.forEach(student => {
        if (submittedSet.has(student.id)) {
          submittedList.push(student);
        } else {
          notSubmittedList.push(student);
        }
      });

      setSubmitted(submittedList);
      setNotSubmitted(notSubmittedList);
    } catch (e) {
      console.error("View submissions error:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = (item: any) => (
    <View
      style={[
        styles.row,
        { backgroundColor: COLORS.card, borderColor: COLORS.border }
      ]}
    >
      <Text style={[styles.name, { color: COLORS.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.roll, { color: COLORS.muted }]}>
        Roll No: {item.roll_no}
      </Text>
    </View>
  );

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
          View Submissions
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* BODY */}
      <View style={styles.body}>

        {/* Submitted Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#22c55e" }]}>
            Submitted ({submitted.length})
          </Text>

          {submitted.length === 0 ? (
            <Text style={[styles.emptyText, { color: COLORS.muted }]}>
              No submissions yet
            </Text>
          ) : (
            <FlatList
              data={submitted}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderStudent(item)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
            />
          )}
        </View>

        {/* Not Submitted Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>
            Not Submitted ({notSubmitted.length})
          </Text>

          {notSubmitted.length === 0 ? (
            <Text style={[styles.emptyText, { color: COLORS.muted }]}>
              Everyone has submitted 🎉
            </Text>
          ) : (
            <FlatList
              data={notSubmitted}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderStudent(item)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  body: {
    flex: 1,
    gap: 12
  },

  section: {
    flex: 1
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8
  },

  listContent: {
    paddingBottom: 8
  },

  row: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },

  name: {
    fontSize: 16,
    fontWeight: "600"
  },

  roll: {
    fontSize: 13,
    marginTop: 4
  },

  emptyText: {
    textAlign: "center",
    marginTop: 12
  }
});
