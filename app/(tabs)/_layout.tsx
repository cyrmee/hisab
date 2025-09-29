import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BorderRadius, Colors } from "../../constants/tokens";
import { useColorScheme } from "../../hooks/use-color-scheme";

// Custom Material 3 style floating tab bar
function MaterialTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const indicator = React.useRef(new Animated.Value(state.index)).current;

  React.useEffect(() => {
    Animated.spring(indicator, { toValue: state.index, useNativeDriver: true, damping: 18, stiffness: 180 } as any).start();
  }, [state.index, indicator]);

  const tabWidth = 1 / state.routes.length;

  return (
    <View style={[styles.barContainer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.borderSecondary }]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: `${tabWidth * 100}%`,
              backgroundColor: colors.primary,
              transform: [{ translateX: indicator.interpolate({ inputRange: [0, state.routes.length - 1], outputRange: [0, (state.routes.length - 1) * 100] }) }],
            },
          ]}
        />
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={route.key} accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} onPress={onPress} style={styles.tabButton}>
              {options.tabBarIcon?.({ color: isFocused ? colors.textInverse : colors.textSecondary, focused: isFocused, size: 20 })}
              <Animated.Text style={[styles.tabLabel, { color: isFocused ? colors.textInverse : colors.textSecondary }]} numberOfLines={1}>
                {label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    marginHorizontal: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'android' ? 1 : 0,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: BorderRadius.lg,
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default function TabLayout() {
  // Using custom MaterialTabBar which internally reads color scheme

  return (
    <Tabs tabBar={(props) => <MaterialTabBar {...props} />} screenOptions={{ headerShown: false }}>
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
