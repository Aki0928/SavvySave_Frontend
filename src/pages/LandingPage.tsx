import React from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
} from '@mui/material';

import Grid from '@mui/material/Grid';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import {
    Psychology,
    TrendingUp,
    Security,
    Speed,
    AutoGraph,
    Savings,
    LightMode,
    DarkMode,
} from '@mui/icons-material';

import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useThemeMode } from '../theme';

interface AuthUser {
    id?: string | number;
    name?: string;
    email?: string;
}

interface AuthContextValue {
    user?: AuthUser | null;
}

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
    toggleTheme: () => void;
    mode: ThemeMode;
}

interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    desc: string;
    gradient: string;
}

const LandingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';

    const themeMode = useThemeMode() as unknown as ThemeModeContextValue;
    const { toggleTheme, mode } = themeMode;

    const auth = useAuth() as unknown as AuthContextValue;
    const user = auth?.user;

    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const features: FeatureItem[] = [
        {
            icon: <Psychology sx={{ fontSize: 40, color: 'white' }} />,
            title: 'AI Financial Advisor',
            desc: 'Chat with our Gemini-powered AI to get personalized financial advice, forecasts, and savings tips instantly.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            icon: <AutoGraph sx={{ fontSize: 40, color: 'white' }} />,
            title: 'Smart Analytics',
            desc: 'Visualize your spending habits with interactive charts and graphs to identify where your money goes.',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
        },
        {
            icon: <Savings sx={{ fontSize: 40, color: 'white' }} />,
            title: 'Budget Tracking',
            desc: "Set monthly budgets for different categories and get alerted when you're close to overspending.",
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                color: 'text.primary',
            }}
        >
            <Box
                component="nav"
                sx={{
                    py: 2,
                    px: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: isDark
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isDark
                        ? '0 4px 20px rgba(0,0,0,0.4)'
                        : '0 2px 10px rgba(0,0,0,0.05)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: 'primary.main',
                                display: 'flex',
                            }}
                        >
                            <TrendingUp sx={{ color: 'white' }} />
                        </Box>
                    </motion.div>

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

                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Toggle Theme">
                        <IconButton
                            onClick={toggleTheme}
                            sx={{ mr: 1, color: 'text.primary' }}
                        >
                            {mode === 'dark' ? <LightMode /> : <DarkMode />}
                        </IconButton>
                    </Tooltip>

                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="text"
                        color="inherit"
                        sx={{ mr: 1, fontWeight: 600 }}
                    >
                        Login
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: isDark
                        ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
                        : 'radial-gradient(circle at 50% 0%, #f3f4f6 0%, #ffffff 100%)',
                    pt: { xs: 12, md: 16 },
                    pb: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 100, -50, 0],
                        y: [0, -50, 50, 0],
                        background: [
                            '#6366f1',
                            '#8b5cf6',
                            '#ec4899',
                            '#6366f1',
                        ],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        filter: 'blur(100px)',
                        borderRadius: '50%',
                    }}
                />

                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -70, 30, 0],
                        y: [0, 80, -40, 0],
                        background: [
                            '#ec4899',
                            '#ef4444',
                            '#f59e0b',
                            '#ec4899',
                        ],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 2,
                    }}
                    style={{
                        position: 'absolute',
                        bottom: -50,
                        left: -100,
                        width: 350,
                        height: 350,
                        filter: 'blur(120px)',
                        borderRadius: '50%',
                    }}
                />

                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.3, 0.1],
                        x: [0, 50, -50, 0],
                        y: [0, -40, 20, 0],
                        background: [
                            '#10b981',
                            '#3b82f6',
                            '#6366f1',
                            '#10b981',
                        ],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 5,
                    }}
                    style={{
                        position: 'absolute',
                        top: '40%',
                        left: '30%',
                        width: 200,
                        height: 200,
                        filter: 'blur(90px)',
                        borderRadius: '50%',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={8} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography
                                    variant="h2"
                                    fontWeight={900}
                                    sx={{
                                        mb: 2,
                                        lineHeight: 1.1,
                                        fontSize: { xs: '2.5rem', md: '4rem' },
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Master Your Money <br />
                                    <Box
                                        component="span"
                                        sx={{
                                            background:
                                                'linear-gradient(to right, #667eea, #764ba2)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter:
                                                'drop-shadow(0 2px 10px rgba(118, 75, 162, 0.3))',
                                        }}
                                    >
                                        with AI Precision
                                    </Box>
                                </Typography>

                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{
                                        mb: 5,
                                        fontWeight: 400,
                                        maxWidth: 500,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Stop guessing where your money goes. Use our
                                    advanced AI advisor to track expenses, analyze
                                    trends, and grow your savings effortlessly.
                                </Typography>

                                <Box
                                    display="flex"
                                    gap={2}
                                    flexDirection={isMobile ? 'column' : 'row'}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            component={RouterLink}
                                            to="/register"
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                py: 1.8,
                                                px: 4,
                                                borderRadius: 50,
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                background:
                                                    'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                                boxShadow:
                                                    '0 10px 25px rgba(102, 126, 234, 0.4)',
                                            }}
                                        >
                                            Start for Free
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            component={RouterLink}
                                            to="/login"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                py: 1.8,
                                                px: 4,
                                                borderRadius: 50,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                borderColor: 'divider',
                                                color: 'text.primary',
                                                bgcolor: isDark
                                                    ? 'rgba(255,255,255,0.05)'
                                                    : 'white',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: isDark
                                                        ? 'rgba(255,255,255,0.1)'
                                                        : '#f8fafc',
                                                },
                                            }}
                                        >
                                            View Demo
                                        </Button>
                                    </motion.div>
                                </Box>

                                <Box
                                    mt={6}
                                    display="flex"
                                    alignItems="center"
                                    gap={4}
                                    color="text.secondary"
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Security color="primary" fontSize="small" />
                                        <Typography variant="body2" fontWeight={500}>
                                            Bank-grade Security
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Speed color="secondary" fontSize="small" />
                                        <Typography variant="body2" fontWeight={500}>
                                            Real-time Analytics
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        perspective: '1000px',
                                    }}
                                >
                                    <Paper
                                        elevation={isDark ? 8 : 4}
                                        sx={{
                                            p: 0,
                                            borderRadius: 4,
                                            position: 'relative',
                                            zIndex: 1,
                                            bgcolor: isDark
                                                ? 'rgba(30, 41, 59, 0.8)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid',
                                            borderColor: isDark
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(255,255,255,0.8)',
                                            overflow: 'hidden',
                                            transform: 'rotateY(-5deg) rotateX(5deg)',
                                            transition: 'transform 0.5s',
                                            '&:hover': {
                                                transform: 'rotateY(0) rotateX(0)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: '#ef4444',
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: '#f59e0b',
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: '#10b981',
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ p: 4 }}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                mb={3}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: isDark
                                                            ? 'rgba(99, 102, 241, 0.2)'
                                                            : '#e0e7ff',
                                                        color: 'primary.main',
                                                    }}
                                                >
                                                    <Psychology />
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                    >
                                                        AI Financial Insight
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Just now • Gemini Pro
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box
                                                sx={{
                                                    p: 3,
                                                    bgcolor: isDark
                                                        ? 'rgba(0,0,0,0.2)'
                                                        : '#f8fafc',
                                                    borderRadius: 2,
                                                    mb: 3,
                                                }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        lineHeight: 1.6,
                                                    }}
                                                >
                                                    "Based on your recent spending,
                                                    I've noticed you could save{' '}
                                                    <Box
                                                        component="span"
                                                        color="success.main"
                                                        fontWeight="bold"
                                                    >
                                                        ₱2,500
                                                    </Box>{' '}
                                                    this month by reducing dining
                                                    out. Your grocery trend is
                                                    stable. 📉"
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    mb={1}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight={600}
                                                        color="text.secondary"
                                                    >
                                                        Monthly Savings Goal
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight={700}
                                                        color="primary.main"
                                                    >
                                                        75%
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        height: 8,
                                                        width: '100%',
                                                        bgcolor: isDark
                                                            ? 'rgba(255,255,255,0.1)'
                                                            : '#e2e8f0',
                                                        borderRadius: 4,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '75%' }}
                                                        transition={{
                                                            duration: 1.5,
                                                            delay: 0.5,
                                                        }}
                                                        style={{
                                                            height: '100%',
                                                            background:
                                                                'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box
                sx={{
                    py: { xs: 8, md: 12 },
                    bgcolor: isDark ? 'background.default' : 'white',
                    position: 'relative',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            borderRadius: 5,
                                            bgcolor: isDark
                                                ? 'background.paper'
                                                : 'white',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'box-shadow 0.3s',
                                            '&:hover': {
                                                boxShadow: isDark
                                                    ? '0 20px 40px rgba(0,0,0,0.4)'
                                                    : '0 20px 40px rgba(102, 126, 234, 0.15)',
                                            },
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ rotate: 5, scale: 1.1 }}
                                            style={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 12,
                                                background: feature.gradient,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 24,
                                                boxShadow:
                                                    '0 10px 20px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            {feature.icon}
                                        </motion.div>

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            gutterBottom
                                        >
                                            {feature.title}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{ lineHeight: 1.7 }}
                                        >
                                            {feature.desc}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Box
                sx={{
                    py: { xs: 4, md: 6 },
                    textAlign: 'center',
                    color: 'text.secondary',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isDark ? '#0f172a' : '#f8fafc',
                }}
            >
                <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                        mb: 1,
                        color: 'text.primary',
                        opacity: 0.8,
                    }}
                >
                    SavvySave
                </Typography>

                <Typography variant="body2">
                    © {new Date().getFullYear()} SavvySave. All rights reserved. •
                    Built with ❤️ and AI.
                </Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;