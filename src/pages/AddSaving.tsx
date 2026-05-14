import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';

import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    Dialog,
    DialogTitle,
    DialogContent,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Fab,
    Slide,
    MenuItem,
    useTheme,
    alpha,
    Tabs,
    Tab,
} from '@mui/material';

import type { TransitionProps } from '@mui/material/transitions';

import {
    AttachMoney,
    TrendingUp,
    TrendingDown,
    Add as AddIcon,
    Close as CloseIcon,
    Category,
    Description,
    ReceiptLong,
    Search,
    Edit as EditIcon,
    CalendarToday,
} from '@mui/icons-material';

type TransactionType = 'income' | 'expense';

type UserId = string | number;

interface AuthUser {
    id?: UserId;
    name?: string;
    email?: string;
}

interface AuthContextValue {
    user?: AuthUser | null;
}

interface CategoryItem {
    id: string | number;
    name: string;
    type: TransactionType;
    color?: string;
}

interface TransactionCategory {
    id?: string | number;
    name?: string;
    color?: string;
    type?: TransactionType;
}

interface TransactionItem {
    id: string | number;
    amount: string | number;
    category_id?: string | number | null;
    category?: TransactionCategory | string | null;
    note?: string | null;
    type: TransactionType;
    date?: string | null;
    created_at?: string | null;
}

interface TransactionPayload {
    amount: number;
    category_id: number;
    note: string;
    type: TransactionType;
    date: string;
}

interface TransactionFilters {
    start_date?: string;
    end_date?: string;
}

interface TransactionApi {
    getCategories: () => Promise<CategoryItem[]>;
    getTransactions: (
        params?: TransactionFilters,
        options?: { signal?: AbortSignal }
    ) => Promise<TransactionItem[]>;
    createTransaction: (payload: TransactionPayload) => Promise<unknown>;
    updateTransaction: (
        transactionId: string | number,
        payload: TransactionPayload
    ) => Promise<unknown>;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

const getFirstDayOfCurrentMonth = (): string => {
    return `${new Date().toISOString().split('T')[0].slice(0, 8)}01`;
};

const getTransactionDate = (transaction: TransactionItem): string => {
    return transaction.date || transaction.created_at || getTodayDate();
};

const getCategoryName = (transaction: TransactionItem): string => {
    if (typeof transaction.category === 'string') {
        return transaction.category;
    }

    return transaction.category?.name || 'Uncategorized';
};

const getCategoryColor = (
    transaction: TransactionItem,
    incomeColor: string,
    expenseColor: string
): string => {
    if (
        transaction.category &&
        typeof transaction.category !== 'string' &&
        transaction.category.color
    ) {
        return transaction.category.color;
    }

    return transaction.type === 'income' ? incomeColor : expenseColor;
};

const Transactions = () => {
    const auth = useAuth() as unknown as AuthContextValue;
    const user = auth?.user;

    const transactionApi = api as unknown as TransactionApi;

    const theme = useTheme();

    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tabValue, setTabValue] = useState<number>(0);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [startDate, setStartDate] = useState<string>(
        getFirstDayOfCurrentMonth()
    );
    const [endDate, setEndDate] = useState<string>(getTodayDate());
    const [useDateFilter, setUseDateFilter] = useState<boolean>(true);

    const [amount, setAmount] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [type, setType] = useState<TransactionType>('expense');
    const [date, setDate] = useState<string>(getTodayDate());
    const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [categories, setCategories] = useState<CategoryItem[]>([]);

    const fetchCategories = async () => {
        try {
            const data = await transactionApi.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchTransactions = async (signal?: AbortSignal) => {
        try {
            setLoading(true);

            const params: TransactionFilters = useDateFilter
                ? {
                      start_date: startDate,
                      end_date: endDate,
                  }
                : {};

            const options = signal ? { signal } : undefined;

            const data = await transactionApi.getTransactions(params, options);

            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(getTransactionDate(a)).getTime();
                const dateB = new Date(getTransactionDate(b)).getTime();

                return dateB - dateA;
            });

            setTransactions(sortedData);
        } catch (error: unknown) {
            const isAbortError =
                error instanceof DOMException && error.name === 'AbortError';

            if (!isAbortError) {
                console.error('Failed to fetch transactions', error);
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        if (user) {
            fetchTransactions(controller.signal);

            if (categories.length === 0) {
                fetchCategories();
            }
        }

        return () => controller.abort();
    }, [user, startDate, endDate, useDateFilter]);

    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setTabValue(newValue);
    };

    const handleOpenModal = (transactionToEdit: TransactionItem | null = null) => {
        if (transactionToEdit) {
            setEditingTx(transactionToEdit);
            setAmount(String(transactionToEdit.amount));
            setCategoryId(String(transactionToEdit.category_id || ''));
            setNote(transactionToEdit.note || '');
            setType(transactionToEdit.type);

            const transactionDate = transactionToEdit.date
                ? transactionToEdit.date.split('T')[0]
                : new Date(transactionToEdit.created_at || getTodayDate())
                      .toISOString()
                      .split('T')[0];

            setDate(transactionDate);
        } else {
            setEditingTx(null);
            setType(tabValue === 1 ? 'income' : 'expense');
            setDate(getTodayDate());
            setAmount('');
            setCategoryId('');
            setNote('');
        }

        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingTx(null);
        setAmount('');
        setCategoryId('');
        setNote('');
        setDate(getTodayDate());
        setType('expense');
        setSubmitting(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!amount || !categoryId) return;

        setSubmitting(true);

        try {
            const payload: TransactionPayload = {
                amount: Number.parseFloat(amount),
                category_id: Number.parseInt(categoryId, 10),
                note,
                type,
                date,
            };

            if (editingTx) {
                await transactionApi.updateTransaction(editingTx.id, payload);
            } else {
                await transactionApi.createTransaction(payload);
            }

            await fetchTransactions();
            handleCloseModal();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTransactions = transactions.filter((transaction) => {
        const matchesTab =
            tabValue === 0
                ? true
                : tabValue === 1
                  ? transaction.type === 'income'
                  : transaction.type === 'expense';

        const categoryName = getCategoryName(transaction).toLowerCase();
        const transactionNote = transaction.note?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        const matchesSearch =
            categoryName.includes(query) || transactionNote.includes(query);

        return matchesTab && matchesSearch;
    });

    const totalAmount = filteredTransactions.reduce((total, transaction) => {
        const value = Number.parseFloat(String(transaction.amount || 0));

        return transaction.type === 'income' ? total + value : total - value;
    }, 0);

    const formatCurrency = (value: string | number): string => {
        const amountValue =
            typeof value === 'string' ? Number.parseFloat(value) : value;

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number.isFinite(amountValue) ? amountValue : 0);
    };

    return (
        <Box
            maxWidth="lg"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 0, md: 0 },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: { xs: 0, sm: 0 },
                    pt: { xs: 0, sm: 0 },
                    mb: 1,
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, fontSize: '1.25rem' }}
                    >
                        Transactions
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem' }}
                    >
                        Manage your financial records
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal(null)}
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        borderRadius: 1.5,
                        px: 2,
                        background:
                            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: 2,
                        '&:hover': {
                            boxShadow: 4,
                            background:
                                'linear-gradient(135deg, #5558e3 0%, #7c4de8 100%)',
                        },
                    }}
                >
                    Add Transaction
                </Button>
            </Box>

            <Card
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 0, sm: 0 },
                    overflow: 'hidden',
                    boxShadow: {
                        xs: 'none',
                        sm: '0 2px 8px rgba(0,0,0,0.05)',
                    },
                    mx: { xs: 0, sm: 0 },
                }}
            >
                <Box
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ px: { xs: 0, sm: 1 }, pt: { xs: 1, sm: 0 } }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{
                                minHeight: { xs: 40, sm: 48 },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: {
                                        xs: '0.8rem',
                                        sm: '0.875rem',
                                    },
                                    minHeight: { xs: 40, sm: 48 },
                                    py: { xs: 1, sm: 1.5 },
                                },
                            }}
                        >
                            <Tab label="All" />
                            <Tab label="Income" />
                            <Tab label="Expenses" />
                        </Tabs>
                    </Box>

                    <Box
                        sx={{
                            px: { xs: 1, sm: 2 },
                            py: 1.5,
                            display: 'flex',
                            gap: 1,
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                            }}
                        >
                            <TextField
                                size="small"
                                type="date"
                                label="From"
                                InputLabelProps={{ shrink: true }}
                                value={startDate}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setStartDate(event.target.value);
                                    setUseDateFilter(true);
                                }}
                                sx={{
                                    width: { xs: '50%', sm: 130 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />

                            <TextField
                                size="small"
                                type="date"
                                label="To"
                                InputLabelProps={{ shrink: true }}
                                value={endDate}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setEndDate(event.target.value);
                                    setUseDateFilter(true);
                                }}
                                sx={{
                                    width: { xs: '50%', sm: 130 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />
                        </Box>

                        <IconButton
                            onClick={() => {
                                const today = getTodayDate();
                                setStartDate(today);
                                setEndDate(today);
                                setUseDateFilter(true);
                            }}
                            size="small"
                            sx={{
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: useDateFilter
                                    ? 'primary.main'
                                    : 'divider',
                                color: useDateFilter
                                    ? 'primary.main'
                                    : 'text.secondary',
                                bgcolor: useDateFilter
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : 'transparent',
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                            }}
                        >
                            <CalendarToday fontSize="small" />
                        </IconButton>

                        <TextField
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setSearchQuery(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                flex: { xs: '1', sm: '1 1 auto' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    fontSize: '0.875rem',
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: { xs: 'none', lg: 'flex' },
                        px: 3,
                        py: 1,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ width: '15%', fontWeight: 700 }}
                    >
                        DATE
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ width: '20%', fontWeight: 700 }}
                    >
                        CATEGORY
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ width: '45%', fontWeight: 700 }}
                    >
                        NOTE
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            width: '15%',
                            textAlign: 'right',
                            fontWeight: 700,
                        }}
                    >
                        AMOUNT
                    </Typography>

                    <Box sx={{ width: 40 }} />
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        p: 0,
                        bgcolor: 'background.default',
                    }}
                >
                    {loading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                p: 5,
                            }}
                        >
                            <CircularProgress size={30} />
                        </Box>
                    ) : filteredTransactions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                            <ReceiptLong
                                sx={{
                                    fontSize: 48,
                                    mb: 1,
                                    color: 'text.disabled',
                                }}
                            />

                            <Typography variant="body1" color="text.secondary">
                                No transactions found
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {filteredTransactions.map((transaction) => {
                                const categoryName =
                                    getCategoryName(transaction);

                                const categoryColor = getCategoryColor(
                                    transaction,
                                    theme.palette.success.main,
                                    theme.palette.error.main
                                );

                                return (
                                    <ListItem
                                        key={transaction.id}
                                        onClick={() =>
                                            handleOpenModal(transaction)
                                        }
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            py: 1,
                                            px: { xs: 1.5, md: 3 },
                                            bgcolor: 'background.paper',
                                            transition: 'background 0.2s',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.04
                                                ),
                                            },
                                            display: 'flex',
                                            flexDirection: {
                                                xs: 'column',
                                                lg: 'row',
                                            },
                                            alignItems: {
                                                xs: 'stretch',
                                                lg: 'center',
                                            },
                                            gap: { xs: 0.5, md: 0 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: {
                                                    xs: 'none',
                                                    lg: 'contents',
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    width: '15%',
                                                    fontSize: '0.8rem',
                                                    fontFamily: 'monospace',
                                                }}
                                            >
                                                {new Date(
                                                    getTransactionDate(
                                                        transaction
                                                    )
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    }
                                                )}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    width: '20%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        bgcolor:
                                                            transaction.type ===
                                                            'income'
                                                                ? 'success.main'
                                                                : 'error.main',
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{ fontSize: '0.85rem' }}
                                                >
                                                    {categoryName}
                                                </Typography>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    width: '45%',
                                                    fontSize: '0.8rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {transaction.note || '-'}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    width: '15%',
                                                    textAlign: 'right',
                                                    fontWeight: 700,
                                                    fontFamily: 'monospace',
                                                    color:
                                                        transaction.type ===
                                                        'income'
                                                            ? 'success.main'
                                                            : 'error.main',
                                                }}
                                            >
                                                {transaction.type === 'income'
                                                    ? '+'
                                                    : ''}
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    width: 40,
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <EditIcon
                                                    sx={{
                                                        fontSize: 16,
                                                        color: 'text.disabled',
                                                        opacity: 0.5,
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: {
                                                    xs: 'flex',
                                                    lg: 'none',
                                                },
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                py: 0.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 1.5,
                                                        bgcolor: alpha(
                                                            categoryColor,
                                                            0.15
                                                        ),
                                                        color: categoryColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Category fontSize="small" />
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        sx={{ lineHeight: 1.2 }}
                                                    >
                                                        {categoryName}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ fontSize: '0.7rem' }}
                                                    >
                                                        {new Date(
                                                            getTransactionDate(
                                                                transaction
                                                            )
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            }
                                                        )}{' '}
                                                        •{' '}
                                                        {transaction.note
                                                            ? `${transaction.note.substring(
                                                                  0,
                                                                  15
                                                              )}${
                                                                  transaction
                                                                      .note
                                                                      .length >
                                                                  15
                                                                      ? '...'
                                                                      : ''
                                                              }`
                                                            : 'No note'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                color={
                                                    transaction.type === 'income'
                                                        ? 'success.main'
                                                        : 'error.main'
                                                }
                                                sx={{ fontFamily: 'monospace' }}
                                            >
                                                {transaction.type === 'income'
                                                    ? '+'
                                                    : ''}
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Box>

                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary">
                        Total{' '}
                        <Box
                            component="span"
                            sx={{ display: { xs: 'none', sm: 'inline' } }}
                        >
                            {useDateFilter
                                ? `(${startDate} - ${endDate})`
                                : '(All Time)'}
                        </Box>
                        :
                    </Typography>

                    <Typography
                        variant="h6"
                        fontWeight={800}
                        color={totalAmount >= 0 ? 'success.main' : 'error.main'}
                    >
                        {formatCurrency(totalAmount)}
                    </Typography>
                </Box>
            </Card>

            <Fab
                color="primary"
                size="medium"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    display: { xs: 'flex', sm: 'none' },
                    background:
                        'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
                onClick={() => handleOpenModal(null)}
            >
                <AddIcon />
            </Fab>

            <Dialog
                open={openModal}
                onClose={submitting ? undefined : handleCloseModal}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                    }}
                >
                    <Typography variant="h6" fontWeight={700} fontSize="1rem">
                        {editingTx ? 'Edit Transaction' : 'Add Transaction'}
                    </Typography>

                    <IconButton
                        size="small"
                        onClick={handleCloseModal}
                        disabled={submitting}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 2, px: 1, pb: 1 }}>
                        <ToggleButtonGroup
                            value={type}
                            exclusive
                            onChange={(
                                _event: React.MouseEvent<HTMLElement>,
                                newType: TransactionType | null
                            ) => {
                                if (newType) {
                                    setType(newType);
                                    setCategoryId('');
                                }
                            }}
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton
                                value="income"
                                color="success"
                                sx={{ py: 0.5, borderRadius: 1 }}
                            >
                                <TrendingUp sx={{ mr: 1, fontSize: 16 }} />
                                Income
                            </ToggleButton>

                            <ToggleButton
                                value="expense"
                                color="error"
                                sx={{ py: 0.5, borderRadius: 1 }}
                            >
                                <TrendingDown sx={{ mr: 1, fontSize: 16 }} />
                                Expense
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Date"
                            required
                            value={date}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setDate(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarToday fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="Amount"
                            type="number"
                            required
                            value={amount}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setAmount(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Category"
                            required
                            value={categoryId}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setCategoryId(event.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Category fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {categories
                                .filter((category) => category.type === type)
                                .map((category) => (
                                    <MenuItem
                                        key={category.id}
                                        value={String(category.id)}
                                        dense
                                    >
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor:
                                                        category.color ||
                                                        'primary.main',
                                                }}
                                            />
                                            {category.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                        </TextField>

                        <TextField
                            fullWidth
                            size="small"
                            label="Note"
                            multiline
                            rows={2}
                            value={note}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setNote(event.target.value)}
                            placeholder="Optional description"
                            sx={{ mb: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment
                                        position="start"
                                        sx={{ mt: 1 }}
                                    >
                                        <Description fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="medium"
                            disabled={submitting}
                            sx={{
                                py: 1,
                                borderRadius: 1,
                                fontWeight: 700,
                                textTransform: 'none',
                                background:
                                    type === 'income'
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                boxShadow: 'none',
                            }}
                        >
                            {submitting ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : editingTx ? (
                                'Update Transaction'
                            ) : (
                                'Save Transaction'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default Transactions;