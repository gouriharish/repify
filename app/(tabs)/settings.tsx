import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { COLORS } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.text }]}>
          Settings
        </Text>
      </View>

      {/* Options */}
      <View style={styles.list}>
        {/* Manage Semesters */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: COLORS.card, borderColor: COLORS.border },
          ]}
          onPress={() => router.push("/semesters")}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(99,102,241,0.15)" },
            ]}
          >
            <Ionicons name="layers" size={22} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: COLORS.text }]}>
              Manage Semesters
            </Text>
            <Text style={[styles.cardSub, { color: COLORS.muted }]}>
              Add / activate semesters
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.muted}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingBottom: 20,
  paddingTop: 50,   // 👈 space at top for notch / status bar
},

  title: { fontSize: 28, fontWeight: "bold" },

  list: { paddingHorizontal: 20 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 13, marginTop: 2 },
});
