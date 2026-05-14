import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Divider,
    Paper,
    Avatar,
} from '@mui/material';

import {
    Person,
    Security,
    Key,
    Save,
    Email as EmailIcon,
    Lock,
} from '@mui/icons-material';

import { api } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { useSnackbar } from '../components/SnackbarContext';

interface AuthUser {
    id?: string | number;
    name?: string;
    email?: string;
}

interface AuthContextValue {
    user?: AuthUser | null;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextValue {
    showSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

interface UpdateProfilePayload {
    name: string;
    email: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
}

interface ProfileApi {
    updateProfile: (data: UpdateProfilePayload) => Promise<unknown>;
    saveGeminiApiKey: (apiKey: string) => Promise<unknown>;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message;
    }

    return fallback;
};

const Profile = () => {
    const auth = useAuth() as unknown as AuthContextValue;
    const user = auth?.user;

    const snackbar = useSnackbar() as unknown as SnackbarContextValue;
    const { showSnackbar } = snackbar;

    const profileApi = api as unknown as ProfileApi;

    const [activeTab, setActiveTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        if (user) {
            setName(user.name ?? '');
            setEmail(user.email ?? '');
        }
    }, [user]);

    const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
        setActiveTab(value);
    };

    const handleUpdateProfile = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            showSnackbar('Passwords do not match', 'error');
            return;
        }

        setLoading(true);

        try {
            const data: UpdateProfilePayload = {
                name,
                email,
                ...(newPassword && {
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }),
            };

            await profileApi.updateProfile(data);

            showSnackbar('Profile updated successfully', 'success');

            if (newPassword) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: unknown) {
            showSnackbar(
                getErrorMessage(error, 'Failed to update profile'),
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveApiKey = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!apiKey.trim()) {
            showSnackbar('Please enter your API key', 'warning');
            return;
        }

        setLoading(true);

        try {
            await profileApi.saveGeminiApiKey(apiKey.trim());

            showSnackbar('API Key saved successfully', 'success');
            setApiKey('');
        } catch (error: unknown) {
            showSnackbar(
                getErrorMessage(error, 'Failed to save API Key'),
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 800,
                mx: 'auto',
                p: { xs: 0, md: 3 },
            }}
        >
            <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                sx={{
                    mb: { xs: 2, md: 4 },
                    px: { xs: 2, md: 0 },
                    pt: { xs: 2, md: 0 },
                }}
            >
                Account Settings
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: { xs: 0, md: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    boxShadow: {
                        xs: 'none',
                        md: '0 2px 8px rgba(0,0,0,0.05)',
                    },
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: { xs: 1, md: 2 },
                        bgcolor: 'background.default',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            minHeight: { xs: 48, md: 56 },
                        },
                    }}
                >
                    <Tab
                        icon={<Person fontSize="small" />}
                        label="Profile Details"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Security fontSize="small" />}
                        label="Security"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Key fontSize="small" />}
                        label="AI Settings"
                        iconPosition="start"
                    />
                </Tabs>

                {activeTab === 0 && (
                    <Box
                        component="form"
                        onSubmit={handleUpdateProfile}
                        sx={{ p: { xs: 2, md: 4 } }}
                    >
                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            alignItems="center"
                            gap={3}
                            mb={4}
                            textAlign={{ xs: 'center', sm: 'left' }}
                        >
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                {(name || 'U').charAt(0).toUpperCase()}
                            </Avatar>

                            <Box>
                                <Typography variant="h6">
                                    {name || 'User'}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {email || 'No email available'}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        <Box display="grid" gap={3}>
                            <TextField
                                label="Full Name"
                                value={name}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setName(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Person
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                fullWidth
                                required
                            />

                            <TextField
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setEmail(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <EmailIcon
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                fullWidth
                                required
                            />

                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Save />
                                        )
                                    }
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box
                        component="form"
                        onSubmit={handleUpdateProfile}
                        sx={{ p: { xs: 2, md: 4 } }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Change Password
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                        >
                            Ensure your account is using a long, random password
                            to stay secure.
                        </Typography>

                        <Box display="grid" gap={3} mt={3}>
                            <TextField
                                label="Current Password"
                                type="password"
                                value={currentPassword}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setCurrentPassword(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Lock
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                fullWidth
                            />

                            <TextField
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setNewPassword(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Lock
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                fullWidth
                            />

                            <TextField
                                label="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => setConfirmPassword(event.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Lock
                                            sx={{
                                                color: 'text.secondary',
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                fullWidth
                            />

                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    disabled={loading || !newPassword}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Save />
                                        )
                                    }
                                >
                                    {loading
                                        ? 'Updating...'
                                        : 'Update Password'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box
                        component="form"
                        onSubmit={handleSaveApiKey}
                        sx={{ p: { xs: 2, md: 4 } }}
                    >
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Box
                                sx={{
                                    p: 1,
                                    bgcolor: 'primary.light',
                                    borderRadius: 2,
                                    color: 'white',
                                }}
                            >
                                <Key />
                            </Box>

                            <Box>
                                <Typography variant="h6">
                                    Gemini API Key
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Manage your connection to Google Gemini AI
                                </Typography>
                            </Box>
                        </Box>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Your API key is stored securely using encryption. You
                            can update it here at any time.
                        </Alert>

                        <TextField
                            label="Gemini API Key"
                            type="password"
                            value={apiKey}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setApiKey(event.target.value)}
                            placeholder="Enter new API key to overwrite"
                            helperText="Leave blank if you don't want to change it"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <Key
                                        sx={{
                                            color: 'text.secondary',
                                            mr: 1,
                                        }}
                                    />
                                ),
                            }}
                        />

                        <Box display="flex" justifyContent="flex-end" mt={3}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading || !apiKey.trim()}
                                startIcon={
                                    loading ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : (
                                        <Save />
                                    )
                                }
                            >
                                {loading ? 'Saving...' : 'Update API Key'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Profile;