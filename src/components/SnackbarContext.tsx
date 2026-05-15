import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// ============ TYPES ============
interface SnackbarContextType {
    showSnackbar: (message: string, severity?: AlertColor) => void;
}

interface SnackbarProviderProps {
    children: ReactNode;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

// ============ CREATE CONTEXT ============
const SnackbarContext = createContext<SnackbarContextType | null>(null);

// ============ PROVIDER COMPONENT ============
export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message: string, severity: AlertColor = 'success'): void => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar((prev) => ({
            ...prev,
            open: false
        }));
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleClose} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleClose} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

// ============ CUSTOM HOOK ============
export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    
    if (!context) {
        throw new Error('useSnackbar must be used within SnackbarProvider');
    }
    
    return context;
};