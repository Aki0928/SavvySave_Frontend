import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSnackbar } from '../components/SnackbarContext';
import { useThemeMode } from '../theme';

import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    Container,
    IconButton,
    useTheme,
    Tooltip,
    CircularProgress,
} from '@mui/material';

import {
    Email,
    Lock,
    Person,
    TrendingUp,
    LightMode,
    DarkMode,
} from '@mui/icons-material';

interface RegisterResult {
    success: boolean;
    error?: string;
}

interface AuthContextValue {
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<RegisterResult>;
}

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
    toggleTheme: () => void;
    mode: ThemeMode;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextValue {
    showSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

const Register = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const auth = useAuth() as unknown as AuthContextValue;
    const { register } = auth;

    const snackbar = useSnackbar() as unknown as SnackbarContextValue;
    const { showSnackbar } = snackbar;

    const themeMode = useThemeMode() as unknown as ThemeModeContextValue;
    const { toggleTheme, mode } = themeMode;

    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const result = await register(name, email, password);

            if (result.success) {
                showSnackbar('Registration successful! Welcome.', 'success');
                navigate('/dashboard');
                return;
            }

            const message = result.error || 'Registration failed. Please try again.';
            setError(message);
            showSnackbar(message, 'error');
        } catch (err) {
            console.error(err);

            const message = 'Something went wrong. Please try again.';
            setError(message);
            showSnackbar(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                    : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10,
                }}
            >
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        textDecoration: 'none',
                    }}
                >
                    <Box
                        sx={{
                            p: 0.8,
                            borderRadius: 1.5,
                            bgcolor: 'primary.main',
                            display: 'flex',
                        }}
                    >
                        <TrendingUp sx={{ color: 'white', fontSize: 20 }} />
                    </Box>

                    <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                            background:
                                '-webkit-linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        SavvySave
                    </Typography>
                </Box>

                <Tooltip title="Toggle Theme">
                    <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
                        {mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background:
                        'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    opacity: isDark ? 1 : 0.6,
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background:
                        'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    opacity: isDark ? 1 : 0.6,
                }}
            />

            <Container
                maxWidth="sm"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: { xs: 2, sm: 3 },
                }}
            >
                <Card
                    sx={{
                        p: { xs: 3, sm: 5 },
                        width: '100%',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: isDark
                            ? 'rgba(30, 41, 59, 0.7)'
                            : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid',
                        borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(255, 255, 255, 0.8)',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                            : '0 8px 32px rgba(100, 100, 200, 0.1)',
                        borderRadius: { xs: 3, sm: 4 },
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                background:
                                    'linear-gradient(to right, #818cf8, #f472b6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Create Account
                        </Typography>

                        <Typography variant="body1" color="text.secondary">
                            Start your savings journey today
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Full Name"
                            required
                            value={name}
                            disabled={loading}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setName(event.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            disabled={loading}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setEmail(event.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            required
                            value={password}
                            disabled={loading}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setPassword(event.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : null
                            }
                            sx={{
                                py: 1.5,
                                background:
                                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                },
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 3,
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        Already have an account?{' '}
                        <RouterLink
                            to="/login"
                            style={{
                                color: '#818cf8',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Sign in
                        </RouterLink>
                    </Typography>
                </Card>
            </Container>
        </Box>
    );
};

export default Register;