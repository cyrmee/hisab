import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackbarOptions {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    duration?: number; // ms
    type?: 'info' | 'success' | 'error';
}

interface SnackbarContextValue {
    showSnackbar: (options: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbar = () => {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
    return ctx;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<SnackbarOptions | null>(null);

    const showSnackbar = useCallback((opts: SnackbarOptions) => {
        setOptions(opts);
        setVisible(true);
    }, []);

    const onDismiss = () => setVisible(false);

    const backgroundColor = options?.type === 'success'
        ? '#2e7d32'
        : options?.type === 'error'
            ? '#c62828'
            : undefined; // default theme color

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                visible={visible}
                onDismiss={onDismiss}
                duration={options?.duration ?? 3000}
                action={options?.actionLabel ? { label: options.actionLabel, onPress: options.onAction } : undefined}
                style={backgroundColor ? { backgroundColor } : undefined}
            >
                {options?.message}
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
