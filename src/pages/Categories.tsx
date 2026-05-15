import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { api, Category } from '../services/api';
import { useSnackbar } from '../components/SnackbarContext';

// ============ TYPES ============
interface CategoryFormData {
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

// ============ COMPONENT ============
const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        type: 'expense',
        icon: '',
        color: '#FF6B6B',
    });
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await api.getCategories<Category[]>();
            setCategories(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category: Category | null = null): void => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                type: category.type,
                icon: category.color || '', // Using color field for icon in form
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

    const handleCloseDialog = (): void => {
        setDialogOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (): Promise<void> => {
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, {
                    name: formData.name,
                    type: formData.type,
                    color: formData.color,
                });
                showSnackbar('Category updated successfully', 'success');
            } else {
                await api.createCategory({
                    name: formData.name,
                    type: formData.type,
                    color: formData.color,
                });
                showSnackbar('Category created successfully', 'success');
            }
            handleCloseDialog();
            fetchCategories();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save category';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await api.deleteCategory(id);
            showSnackbar('Category deleted successfully', 'success');
            fetchCategories();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
            showSnackbar(errorMessage, 'error');
        }
    };

    const expenseCategories = categories.filter((c: Category) => c.type === 'expense');
    const incomeCategories = categories.filter((c: Category) => c.type === 'income');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                mb={3} 
                gap={{ xs: 2, sm: 0 }}
            >
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
                {/* Expense Categories */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
                        Expense Categories
                    </Typography>
                    <Grid container spacing={2}>
                        {expenseCategories.map((category) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={category.id}>
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

                {/* Income Categories */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
                        Income Categories
                    </Typography>
                    <Grid container spacing={2}>
                        {incomeCategories.map((category) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={category.id}>
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

            {/* Add/Edit Dialog */}
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
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
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