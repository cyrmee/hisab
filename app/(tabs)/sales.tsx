import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles } from '../../constants/styles';
import { Spacing } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function SalesScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme ?? 'light');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        <View style={{ marginTop: Spacing.lg }}>
          <Text style={styles.heading1}>Sales</Text>
          <Text style={styles.bodySecondary}>
            Welcome to your sales page. Here you can process new sales and view transaction history.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
