import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function AssignmentDetails() {
  const router = useRouter();
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const { COLORS } = useTheme();

  const [assignment, setAssignment] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) load();
  }, [assignmentId]);

  const load = async () => {
    try {
      // Fetch assignment + subject
      const { data } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          due_date,
          subject:subjects (
            id,
            name
          )
        `)
        .eq("id", assignmentId)
        .single();

      if (data) {
        setAssignment(data);
        setSubject(data.subject);
      }
    } catch (e) {
      console.error("Assignment load error:", e);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAssignment = async () => {
  Alert.alert(
    "Delete Assignment",
    "Are you sure you want to delete this assignment?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase
            .from("assignments")
            .delete()
            .eq("id", assignmentId);

          router.back(); // go back to subject page
        }
      }
    ]
  );
};


  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text>Assignment not found</Text>
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
    Assignment
  </Text>

  <TouchableOpacity onPress={deleteAssignment}>
    <Ionicons name="trash-outline" size={22} color="#ef4444" />
  </TouchableOpacity>
</View>


      {/* Assignment Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: COLORS.card, borderColor: COLORS.border }
        ]}
      >
        <Text style={[styles.subjectName, { color: COLORS.muted }]}>
          {subject?.name}
        </Text>
        <Text style={[styles.title, { color: COLORS.text }]}>
          {assignment.title}
        </Text>
        <Text style={[styles.due, { color: COLORS.muted }]}>
          Due: {moment(assignment.due_date).format("DD MMM YYYY")}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/assignments/mark-submissions",
              params: { assignmentId }
            } as any)
          }
        >
          <Ionicons name="checkbox-outline" size={20} color="white" />
          <Text style={styles.actionText}>Mark Submissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.card }]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/assignments/view-submissions",
              params: { assignmentId }
            } as any)
          }
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.text} />
          <Text style={[styles.actionText, { color: COLORS.text }]}>
            View Submissions
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700"
  },

  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 40
  },

  subjectName: {
    fontSize: 14,
    marginBottom: 6
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10
  },

  due: {
    fontSize: 14
  },

  actions: {
    gap: 16
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 10
  },

  actionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
});
