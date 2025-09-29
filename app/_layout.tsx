import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from 'react-native-paper';
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SnackbarProvider } from '../components/ui/snackbar-provider';
import { usePaperTheme } from '../constants/paper-theme';

import { initializeDatabase, testDatabase } from "../services/database";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const paperTheme = usePaperTheme();
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log("Testing database connection...");
        const isWorking = testDatabase();
        if (!isWorking) {
          console.error("Database test failed");
          return;
        }

        console.log("Initializing database...");
        await initializeDatabase();
        console.log("Database setup completed");
      } catch (error) {
        console.error("Database setup failed:", error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <SnackbarProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </SnackbarProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
