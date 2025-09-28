import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Modal,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStyles } from '../../constants/styles';
import { Spacing, Colors } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { exportDataToJSON, importDataFromJSON } from '../../services/database';

const THEME_KEY = '@hisab_theme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme ?? 'light');
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isLightTheme, setIsLightTheme] = useState(colorScheme === 'light');
  const [loading, setLoading] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleThemeChange = async (lightTheme: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, lightTheme ? 'light' : 'dark');
      setIsLightTheme(lightTheme);
      
      Alert.alert(
        'Theme Changed', 
        'Please restart the app to apply the new theme.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Theme change error:', err);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const handleDataBackup = async () => {
    setLoading(true);
    try {
      const jsonData = await exportDataToJSON();
      
      // Use sharing directly with the JSON content
      await Share.share({
        message: jsonData,
        title: 'Hisab Data Backup'
      });
      
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDataImport = async () => {
    Alert.alert(
      'Import Data',
      'This will replace all existing data with the imported data. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
              });

              if (result.canceled) return;

              setLoading(true);
              
              const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
              await importDataFromJSON(fileContent);
              
              Alert.alert('Success', 'Data imported successfully');
            } catch (error) {
              console.error('Import error:', error);
              Alert.alert('Error', 'Failed to import data. Please check the file format.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    rightElement 
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
        {rightElement || (
          onPress && <FontAwesome name="chevron-right" size={16} color={colors.textTertiary} />
        )}
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
          {/* Appearance Section */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[styles.heading3, { marginBottom: Spacing.md }]}>Appearance</Text>
            
            <SettingItem
              icon="paint-brush"
              title="Theme"
              description={isLightTheme ? "Light theme" : "Dark theme"}
              onPress={() => setShowThemeModal(true)}
            />
          </View>

          {/* Data Management Section */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[styles.heading3, { marginBottom: Spacing.md }]}>Data Management</Text>
            
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

          {/* About Section */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[styles.heading3, { marginBottom: Spacing.md }]}>About</Text>
            
            <SettingItem
              icon="info-circle"
              title="Version"
              description="1.0.0"
            />

            <SettingItem
              icon="heart"
              title="Made with"
              description="React Native & Expo"
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

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.safeContainer}>
            {/* Modal Header */}
            <View style={[styles.flexRow, { 
              justifyContent: 'space-between', 
              marginBottom: Spacing.lg,
              marginTop: Spacing.lg 
            }]}>
              <Text style={styles.heading2}>Choose Theme</Text>
              <TouchableOpacity
                onPress={() => setShowThemeModal(false)}
                style={styles.buttonSecondary}
              >
                <Text style={[styles.body, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View>
              {/* Light Theme Option */}
              <TouchableOpacity
                style={[
                  styles.listItemCompact,
                  { marginBottom: Spacing.md },
                  isLightTheme && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  handleThemeChange(true);
                  setShowThemeModal(false);
                }}
              >
                <View style={styles.flexRow}>
                  <FontAwesome 
                    name="sun-o" 
                    size={24} 
                    color={colors.text} 
                    style={{ marginRight: Spacing.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>Light Theme</Text>
                    <Text style={styles.bodySecondary}>Clean and bright interface</Text>
                  </View>
                  {isLightTheme && (
                    <FontAwesome name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Dark Theme Option */}
              <TouchableOpacity
                style={[
                  styles.listItemCompact,
                  { marginBottom: Spacing.md },
                  !isLightTheme && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  handleThemeChange(false);
                  setShowThemeModal(false);
                }}
              >
                <View style={styles.flexRow}>
                  <FontAwesome 
                    name="moon-o" 
                    size={24} 
                    color={colors.text} 
                    style={{ marginRight: Spacing.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>Dark Theme</Text>
                    <Text style={styles.bodySecondary}>Easy on the eyes</Text>
                  </View>
                  {!isLightTheme && (
                    <FontAwesome name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={[styles.bodySecondary, { marginTop: Spacing.md, textAlign: 'center' }]}>
                Theme changes require an app restart to take effect
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}