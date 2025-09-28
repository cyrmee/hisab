import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createStyles } from "../../constants/styles";
import { Colors, Spacing } from "../../constants/tokens";
import { exportDataToJSON, importDataFromJSON } from "../../services/database";

export default function SettingsScreen() {
  const styles = createStyles();
  const colors = Colors.light;

  const [loading, setLoading] = useState(false);

  const handleDataBackup = async () => {
    setLoading(true);
    try {
      const jsonData = await exportDataToJSON();

      // Use sharing directly with the JSON content
      await Share.share({
        message: jsonData,
        title: "Hisab Data Backup",
      });
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("Error", "Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  const handleDataImport = async () => {
    Alert.alert(
      "Import Data",
      "This will replace all existing data with the imported data. This action cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
              });

              if (result.canceled) return;

              setLoading(true);

              const fileContent = await FileSystem.readAsStringAsync(
                result.assets[0].uri
              );
              await importDataFromJSON(fileContent);

              Alert.alert("Success", "Data imported successfully");
            } catch (error) {
              console.error("Import error:", error);
              Alert.alert(
                "Error",
                "Failed to import data. Please check the file format."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    rightElement,
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.listItemCompact, { marginBottom: Spacing.md }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.flexRow}>
        <FontAwesome
          name={icon as any}
          size={24}
          color={colors.primary}
          style={{ marginRight: Spacing.md }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.body}>{title}</Text>
          {description && (
            <Text style={styles.bodySecondary}>{description}</Text>
          )}
        </View>
        {rightElement ||
          (onPress && (
            <FontAwesome
              name="chevron-right"
              size={16}
              color={colors.textTertiary}
            />
          ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        {/* Header */}
        <View style={{ marginTop: Spacing.lg, marginBottom: Spacing.lg }}>
          <Text style={styles.heading1}>Settings</Text>
          <Text style={styles.bodySecondary}>
            Configure your app preferences and manage your data
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Data Management Section */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[styles.heading3, { marginBottom: Spacing.md }]}>
              Data Management
            </Text>

            <SettingItem
              icon="download"
              title="Backup Data"
              description="Export all your data to a JSON file"
              onPress={handleDataBackup}
            />

            <SettingItem
              icon="upload"
              title="Import Data"
              description="Replace current data with backup file"
              onPress={handleDataImport}
            />
          </View>

          {/* Loading indicator */}
          {loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Processing...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
