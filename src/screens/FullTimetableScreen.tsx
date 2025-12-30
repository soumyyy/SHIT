import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TimetableGrid } from "@/components/TimetableGrid";
import { colors, radii, spacing, typography } from "@/constants/theme";
import { useData } from "@/data/DataContext";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const FullTimetableScreen = () => {
  const { slots, subjects, addSubject, addSlot } = useData();

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectRoom, setSubjectRoom] = useState("");

  const [slotSubjectId, setSlotSubjectId] = useState(subjects[0]?.id ?? "");
  const [slotDay, setSlotDay] = useState(0);
  const [slotStart, setSlotStart] = useState("10:00");
  const [slotEnd, setSlotEnd] = useState("11:00");
  const [slotRoom, setSlotRoom] = useState("");

  useEffect(() => {
    if (!subjects.length) {
      setSlotSubjectId("");
      return;
    }
    const stillExists = subjects.some((subject) => subject.id === slotSubjectId);
    if (!stillExists) {
      setSlotSubjectId(subjects[0].id);
    }
  }, [subjects, slotSubjectId]);

  const handleAddSubject = async () => {
    try {
      await addSubject({ id: subjectCode, name: subjectName, defaultRoom: subjectRoom });
      setSubjectCode("");
      setSubjectName("");
      setSubjectRoom("");
      Alert.alert("Saved", "Subject added.");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleAddSlot = async () => {
    if (!slotSubjectId) {
      Alert.alert("Add a subject first");
      return;
    }
    try {
      await addSlot({
        subjectId: slotSubjectId,
        dayOfWeek: slotDay,
        startTime: slotStart,
        endTime: slotEnd,
        room: slotRoom,
      });
      Alert.alert("Saved", "Timetable slot added.");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TimetableGrid slots={slots} subjects={subjects} />

        {/*
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add subject</Text>
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Code"
              value={subjectCode}
              autoCapitalize="characters"
              onChangeText={setSubjectCode}
            />
            <TextInput
              style={[styles.input, styles.inputGrow]}
              placeholder="Name"
              value={subjectName}
              onChangeText={setSubjectName}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Default room (optional)"
            value={subjectRoom}
            onChangeText={setSubjectRoom}
          />
          <Pressable onPress={handleAddSubject} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save subject</Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add slot</Text>
          <View style={styles.selectRow}>
            {dayLabels.map((label, index) => (
              <Pressable
                key={label}
                onPress={() => setSlotDay(index)}
                style={[styles.dayChip, slotDay === index && styles.dayChipSelected]}
              >
                <Text
                  style={[
                    styles.dayChipLabel,
                    slotDay === index && styles.dayChipLabelSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {subjects.length === 0 ? (
            <Text style={styles.helperText}>Add a subject to unlock slot creation.</Text>
          ) : (
            <View style={styles.subjectChips}>
              {subjects.map((subject) => (
                <Pressable
                  key={subject.id}
                  onPress={() => setSlotSubjectId(subject.id)}
                  style={[
                    styles.subjectChip,
                    slotSubjectId === subject.id && styles.subjectChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.subjectChipLabel,
                      slotSubjectId === subject.id && styles.subjectChipLabelSelected,
                    ]}
                  >
                    {subject.id}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Start HH:MM"
              value={slotStart}
              onChangeText={setSlotStart}
            />
            <TextInput
              style={styles.input}
              placeholder="End HH:MM"
              value={slotEnd}
              onChangeText={setSlotEnd}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Room"
            value={slotRoom}
            onChangeText={setSlotRoom}
          />
          <Pressable onPress={handleAddSlot} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save slot</Text>
          </Pressable>
        </View>
        */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xl + spacing.lg + spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  inputGrow: {
    flex: 1.5,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dayChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayChipLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  dayChipLabelSelected: {
    color: "#FFF",
  },
  subjectChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  helperText: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subjectChip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  subjectChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  subjectChipLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  subjectChipLabelSelected: {
    color: "#FFF",
  },
});
