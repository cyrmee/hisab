import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, Text, View } from 'react-native';
import { ActivityIndicator, Divider, List, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSnackbar } from '../../components/ui/snackbar-provider';
import { createStyles } from '../../constants/styles';
import { Spacing } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { clearAllData, exportDataToJSON, importDataFromJSON } from '../../services/database';
import { loadPreferences, savePreferences } from '../../services/preferences';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  // colors retained via styles & theme usage (direct Colors not needed now)

  const [loading, setLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const { showSnackbar } = useSnackbar();

  // Load preferences on mount
  useEffect(() => {
    (async () => {
      const prefs = await loadPreferences();
      setAutoBackup(prefs.autoBackup);
      setAnalyticsEnabled(prefs.analyticsEnabled);
    })();
  }, []);

  const updateAutoBackup = async (value: boolean) => {
    setAutoBackup(value);
    await savePreferences({ autoBackup: value });
    showSnackbar({ message: `Auto backup ${value ? 'enabled' : 'disabled'}` });
  };

  const updateAnalytics = async (value: boolean) => {
    setAnalyticsEnabled(value);
    await savePreferences({ analyticsEnabled: value });
    showSnackbar({ message: `Analytics ${value ? 'enabled' : 'disabled'}` });
  };

  const handleClearAllConfirm = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all products, sales and customer records. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: handleClearAllSecond }
    ]);
  };

  const handleClearAllSecond = () => {
    Alert.alert('Are you sure?', 'This cannot be undone. Tap DELETE EVERYTHING to proceed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'DELETE EVERYTHING', style: 'destructive', onPress: clearAll }
    ]);
  };

  const clearAll = async () => {
    setLoading(true);
    try {
      await clearAllData();
      showSnackbar({ message: 'All data cleared', type: 'success' });
    } catch {
      showSnackbar({ message: 'Failed to clear data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      showSnackbar({ message: 'Failed to create backup', type: 'error' });
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

              showSnackbar({ message: 'Data imported successfully', type: 'success' });
            } catch (error) {
              console.error("Import error:", error);
              showSnackbar({ message: 'Failed to import data (check file format)', type: 'error' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
          <List.Section>
            <List.Subheader>Data</List.Subheader>
            <List.Item
              title="Backup Data"
              description="Export all your data to a JSON file"
              left={(props: any) => <List.Icon {...props} icon="download" />}
              onPress={handleDataBackup}
            />
            <List.Item
              title="Import Data"
              description="Replace current data with backup file"
              left={(props: any) => <List.Icon {...props} icon="upload" />}
              onPress={handleDataImport}
            />
          </List.Section>
          <Divider />
          <List.Section>
            <List.Subheader>Preferences</List.Subheader>
            <List.Item
              title="Automatic Backups"
              description="Periodically export data (local only)"
              left={(p: any) => <List.Icon {...p} icon="content-save" />}
              right={() => <Switch value={autoBackup} onValueChange={updateAutoBackup} />}
            />
            <List.Item
              title="Analytics"
              description="Anonymous usage metrics"
              left={(p: any) => <List.Icon {...p} icon="chart-bar" />}
              right={() => <Switch value={analyticsEnabled} onValueChange={updateAnalytics} />}
            />
          </List.Section>
          <Divider />
          <List.Section>
            <List.Subheader>Danger Zone</List.Subheader>
            <List.Item
              title="Clear All Data"
              description="Remove all products, sales and customers"
              left={(p: any) => <List.Icon {...p} icon="delete" />}
              onPress={handleClearAllConfirm}
            />
          </List.Section>
          {loading && (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator />
              <Text style={[styles.bodySecondary, { marginTop: Spacing.sm }]}>Processing...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
