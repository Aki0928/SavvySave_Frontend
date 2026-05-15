import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useMethods } from '../hooks/useMethods';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip,
    Avatar,
    LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Psychology,
    TrendingUp,
    Lightbulb,
    EmojiEvents,
    AttachMoney,
    Category as CategoryIcon,
    Warning,
} from '@mui/icons-material';

// ============ TYPES ============
interface Transaction {
    id: number;
    amount: string | number;
    type: 'income' | 'expense';
    category: string;
    category_id: number;
    note?: string;
    date: string;
}

interface Report {
    income: number;
    expenses: number;
    balance: number;
    count: number;
    averageTransaction: number;
    topCategory: string;
    topCategoryAmount: number;
    expenseRatio: number;
    insights: string[];
}

interface CategoryTotals {
    [key: string]: number;
}

// ============ COMPONENT ============
const Analysis = () => {
    const { user } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { get } = useMethods();

    useEffect(() => {
        const analyzeData = async () => {
            if (user) {
                try {
                    const transactions = await get<Transaction[]>('/transactions');
                    
                    // Calculate income and expenses
                    const income = transactions
                        .filter(t => t.type === 'income')
                        .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
                    
                    const expenses = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
                    
                    const balance = income - expenses;
                    const count = transactions.length;
                    const averageTransaction = count > 0 ? (income + expenses) / count : 0;

                    // Calculate category totals
                    const categories: CategoryTotals = {};
                    transactions.forEach((t) => {
                        const categoryName = t.category;
                        if (!categories[categoryName]) {
                            categories[categoryName] = 0;
                        }
                        categories[categoryName] += parseFloat(String(t.amount));
                    });

                    // Find top category
                    const topCategoryEntry = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
                    const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'None';
                    const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

                    // Generate insights
                    const insights: string[] = [];

                    if (count === 0) {
                        insights.push("Start tracking transactions to get personalized insights!");
                    } else {
                        insights.push(`You have made ${count} transactions with an average amount of $${averageTransaction.toFixed(2)}.`);

                        if (balance > 0) {
                            insights.push(`Great job! You have a positive balance of $${balance.toFixed(2)}.`);
                        } else if (balance < 0) {
                            insights.push(`Warning: You've spent $${Math.abs(balance).toFixed(2)} more than you've earned.`);
                        }

                        if (topCategory !== 'None') {
                            insights.push(`Your most active category is ${topCategory} with $${topCategoryAmount.toFixed(2)}.`);
                        }

                        const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
                        if (expenseRatio > 80) {
                            insights.push(`Your expenses are ${expenseRatio.toFixed(0)}% of your income. Consider reducing spending.`);
                        } else if (expenseRatio < 50 && income > 0) {
                            insights.push(`Excellent! You're only spending ${expenseRatio.toFixed(0)}% of your income.`);
                        }

                        if (income > 1000) {
                            insights.push("You've earned over $1,000! Keep up the good work.");
                        }
                    }

                    setReport({
                        income,
                        expenses,
                        balance,
                        count,
                        averageTransaction,
                        topCategory,
                        topCategoryAmount,
                        expenseRatio: income > 0 ? (expenses / income) * 100 : 0,
                        insights,
                    });
                } catch (e) {
                    console.error('Analysis failed', e);
                } finally {
                    setLoading(false);
                }
            }
        };
        
        analyzeData();
    }, [user, get]);

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Loading analysis...</Typography>
            </Box>
        );
    }

    if (!report) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>No data available. Please add some transactions.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                        <Psychology />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        AI Financial Analysis
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Smart insights based on your transaction history
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {/* Financial Metrics Card */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                <TrendingUp sx={{ color: 'success.main', fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Financial Metrics
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* Net Balance */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AttachMoney sx={{ color: 'success.main' }} />
                                        <Typography variant="body2">Net Balance</Typography>
                                    </Box>
                                    <Chip
                                        label={`$${report.balance.toFixed(2)}`}
                                        sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                                        color={report.balance >= 0 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </Box>

                                {/* Top Category */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CategoryIcon sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2">Top Category</Typography>
                                    </Box>
                                    <Chip
                                        label={report.topCategory}
                                        sx={{ fontWeight: 700, fontFamily: 'monospace', bgcolor: 'primary.dark' }}
                                        size="small"
                                    />
                                </Box>

                                {/* Transactions Count */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmojiEvents sx={{ color: 'secondary.main' }} />
                                        <Typography variant="body2">Transactions</Typography>
                                    </Box>
                                    <Chip
                                        label={report.count}
                                        sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                                        color="secondary"
                                        size="small"
                                    />
                                </Box>

                                {/* Expense Ratio Progress Bar */}
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Expense Ratio
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {report.expenseRatio.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(report.expenseRatio, 100)}
                                        color={report.expenseRatio > 80 ? 'error' : report.expenseRatio > 60 ? 'warning' : 'success'}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* AI Insights Card */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            borderLeft: '4px solid',
                            borderLeftColor: 'secondary.main',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                <Lightbulb sx={{ color: 'warning.main', fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    AI Insights
                                </Typography>
                            </Box>

                            <List sx={{ p: 0 }}>
                                {report.insights.map((insight, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem sx={{ px: 0, py: 1.5 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        bgcolor: insight.includes('Warning') ? 'error.main' : 'secondary.main',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {insight.includes('Warning') ? <Warning fontSize="small" /> : index + 1}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={insight}
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    color: 'text.primary',
                                                }}
                                            />
                                        </ListItem>
                                        {index < report.insights.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analysis;