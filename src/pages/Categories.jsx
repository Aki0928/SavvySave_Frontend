import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import { api } from '../services/api';
import { useSnackbar } from '../components/SnackbarContext';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        icon: '',
        color: '#FF6B6B',
    });
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            showSnackbar('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                type: category.type,
                icon: category.icon || '',
                color: category.color || '#FF6B6B',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                type: 'expense',
                icon: '',
                color: '#FF6B6B',
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, formData);
                showSnackbar('Category updated successfully', 'success');
            } else {
                await api.createCategory(formData);
                showSnackbar('Category created successfully', 'success');
            }
            handleCloseDialog();
            fetchCategories();
        } catch (error) {
            showSnackbar(error.message || 'Failed to save category', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await api.deleteCategory(id);
            showSnackbar('Category deleted successfully', 'success');
            fetchCategories();
        } catch (error) {
            showSnackbar(error.message || 'Failed to delete category', 'error');
        }
    };

    const expenseCategories = categories.filter(c => c.type === 'expense');
    const incomeCategories = categories.filter(c => c.type === 'income');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} gap={{ xs: 2, sm: 0 }}>
                <Typography variant="h4" fontWeight={700}>
                    Categories
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    fullWidth={false}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Add Category
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
                        Expense Categories
                    </Typography>
                    <Grid container spacing={2}>
                        {expenseCategories.map((category) => (
                            <Grid item xs={12} sm={6} key={category.id}>
                                <Card>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: category.color,
                                                    }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {category.name}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(category.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
                        Income Categories
                    </Typography>
                    <Grid container spacing={2}>
                        {incomeCategories.map((category) => (
                            <Grid item xs={12} sm={6} key={category.id}>
                                <Card>
                                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: category.color,
                                                    }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {category.name}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(category.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            select
                            label="Type"
                            fullWidth
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <MenuItem value="expense">Expense</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                        </TextField>
                        <TextField
                            label="Color"
                            type="color"
                            fullWidth
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                        <TextField
                            label="Icon (Material Icon name)"
                            fullWidth
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            helperText="e.g., restaurant, shopping_bag, etc."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Categories;
