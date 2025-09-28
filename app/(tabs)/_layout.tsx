import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "../../components/haptic-tab";
import { Colors } from "../../constants/tokens";
import { useColorScheme } from "../../hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopWidth: Platform.OS === 'ios' ? 0 : 1,
          borderTopColor: Platform.OS === 'ios' ? 'transparent' : colors.borderSecondary,
          elevation: Platform.OS === 'android' ? 8 : 0,
          shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
          shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : { width: 0, height: 0 },
          shadowRadius: Platform.OS === 'ios' ? 4 : 0,
          shadowColor: '#000',
          height: Platform.OS === 'ios' ? (60 + insets.bottom) : (64 + insets.bottom),
          paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 8 : 12),
          paddingTop: Platform.OS === 'ios' ? 8 : 12,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 12 : 13,
          fontWeight: Platform.OS === 'ios' ? "600" : "500",
          marginTop: Platform.OS === 'ios' ? 4 : 2,
        },
        tabBarIconStyle: {
          marginBottom: Platform.OS === 'ios' ? 2 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="usd" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="erub"
        options={{
          title: "Customers",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="users" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
