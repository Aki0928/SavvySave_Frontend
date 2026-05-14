import React, { useCallback, useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Switch,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';

import { Edit, AdminPanelSettings } from '@mui/icons-material';
import { api } from '../services/api';
import { useSnackbar } from '../components/SnackbarContext';

type UserId = string | number;

interface User {
    id: UserId;
    name: string;
    email: string;
    is_admin: boolean;
    is_active: boolean;
}

interface UserFormData {
    name: string;
    email: string;
    is_admin: boolean;
}

interface UserManagementApi {
    getUsers: () => Promise<User[]>;
    toggleUserStatus: (userId: UserId) => Promise<unknown>;
    updateUser: (userId: UserId, data: UserFormData) => Promise<unknown>;
}

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextValue {
    showSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

interface ApiErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const userManagementApi = api as unknown as UserManagementApi;

const getErrorMessage = (error: unknown, fallback: string): string => {
    const apiError = error as ApiErrorResponse;

    if (apiError?.response?.data?.message) {
        return apiError.response.data.message;
    }

    if (apiError?.message) {
        return apiError.message;
    }

    return fallback;
};

const UserManagement = () => {
    const snackbar = useSnackbar() as unknown as SnackbarContextValue;
    const { showSnackbar } = snackbar;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        is_admin: false,
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const data = await userManagementApi.getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error: unknown) {
            showSnackbar(
                getErrorMessage(error, 'Failed to load users'),
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleStatus = async (userId: UserId) => {
        try {
            await userManagementApi.toggleUserStatus(userId);

            showSnackbar('User status updated successfully', 'success');
            await fetchUsers();
        } catch (error: unknown) {
            showSnackbar(
                getErrorMessage(error, 'Failed to update user status'),
                'error'
            );
        }
    };

    const handleOpenDialog = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            is_admin: user.is_admin,
        });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            is_admin: false,
        });
    };

    const handleSubmit = async () => {
        if (!editingUser) {
            showSnackbar('No user selected', 'warning');
            return;
        }

        if (!formData.name.trim() || !formData.email.trim()) {
            showSnackbar('Name and email are required', 'warning');
            return;
        }

        try {
            setSaving(true);

            await userManagementApi.updateUser(editingUser.id, {
                name: formData.name.trim(),
                email: formData.email.trim(),
                is_admin: formData.is_admin,
            });

            showSnackbar('User updated successfully', 'success');
            handleCloseDialog();
            await fetchUsers();
        } catch (error: unknown) {
            showSnackbar(
                getErrorMessage(error, 'Failed to update user'),
                'error'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>
                User Management
            </Typography>

            <Card
                sx={{
                    mx: { xs: -2, sm: 0 },
                    borderRadius: { xs: 0, sm: 1 },
                }}
            >
                <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{ overflowX: 'auto' }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>Name</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Email</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Role</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Status</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Active</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Actions</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>

                                        <TableCell>
                                            {user.is_admin ? (
                                                <Chip
                                                    icon={<AdminPanelSettings />}
                                                    label="Admin"
                                                    color="primary"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    label="User"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={
                                                    user.is_active
                                                        ? 'Active'
                                                        : 'Inactive'
                                                }
                                                color={
                                                    user.is_active
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Switch
                                                checked={user.is_active}
                                                onChange={() =>
                                                    handleToggleStatus(user.id)
                                                }
                                                color="success"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleOpenDialog(user)
                                                }
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                py={3}
                                            >
                                                No users found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onClose={saving ? undefined : handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit User</DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            pt: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Name"
                            fullWidth
                            value={formData.name}
                            disabled={saving}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) =>
                                setFormData((previous) => ({
                                    ...previous,
                                    name: event.target.value,
                                }))
                            }
                        />

                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            disabled={saving}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) =>
                                setFormData((previous) => ({
                                    ...previous,
                                    email: event.target.value,
                                }))
                            }
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography>Admin Role</Typography>

                            <Switch
                                checked={formData.is_admin}
                                disabled={saving}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        is_admin: event.target.checked,
                                    }))
                                }
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={saving}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={saving}
                        startIcon={
                            saving ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : null
                        }
                    >
                        {saving ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;