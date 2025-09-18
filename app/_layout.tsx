import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "../hooks/use-color-scheme";
import { initializeDatabase, testDatabase } from "../services/database";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen
            name="search-filter"
            options={{ presentation: "formSheet", title: "Search & Filter" }}
          />
          <Stack.Screen
            name="product-form"
            options={{ presentation: "formSheet", title: "Product Form" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
