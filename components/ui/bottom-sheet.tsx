import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BorderRadius, Colors, Shadow } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface BottomSheetProps {
    visible: boolean;
    onDismiss: () => void;
    children: React.ReactNode;
    height?: number | 'auto';
    snapPoint?: number; // percentage of screen height 0-1
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onDismiss,
    children,
    height = 'auto',
    snapPoint = 0.66,
}) => {
    const scheme = useColorScheme();
    const colors = Colors[scheme];
    const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: Dimensions.get('window').height, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
            ]).start();
        }
    }, [visible, opacity, translateY]);

    if (!visible) return null;

    const sheetHeight = height === 'auto' ? undefined : height;
    const maxHeight = Dimensions.get('window').height * snapPoint;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
                style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)', opacity }]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
            </Animated.View>
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: BorderRadius.xl,
                        borderTopRightRadius: BorderRadius.xl,
                        maxHeight: sheetHeight || maxHeight,
                        transform: [{ translateY }],
                        ...Platform.select({ ios: Shadow.lg, android: { elevation: 18 } }),
                    },
                ]}
            >
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                </View>
                <View style={{ flexGrow: 1 }}>
                    {children}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    handleContainer: {
        paddingTop: 8,
        paddingBottom: 4,
        alignItems: 'center',
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 3,
        opacity: 0.4,
    },
});
