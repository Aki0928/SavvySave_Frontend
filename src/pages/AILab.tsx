import React, { useEffect, useRef, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import {
    AutoGraph,
    BarChart as BarChartIcon,
    Description,
    Insights,
    Key,
    Psychology,
    Refresh,
    Send,
    Timeline,
    TrendingUp,
    Warning,
} from '@mui/icons-material';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { useSnackbar } from '../components/SnackbarContext';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextValue {
    showSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

type AIMode = 'conversation' | 'statistical';

type AISpeed = 'fast' | 'planning';

type MessageRole = 'user' | 'ai';

interface ChartDataItem {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface AIChartData {
    type?: 'bar' | 'line' | 'pie';
    title?: string;
    data: ChartDataItem[];
}

interface ChatMessageItem {
    role: MessageRole;
    content: string;
    chart?: AIChartData | null;
    suggestions?: string[] | null;
}

interface ApiKeyResponse {
    has_api_key: boolean;
}

interface ChatResponse {
    response: string;
}

interface AIChatOptions {
    mode: AIMode;
    speed: AISpeed;
}

interface AILabApi {
    checkApiKey: () => Promise<ApiKeyResponse>;
    saveGeminiApiKey: (apiKey: string) => Promise<unknown>;
    chatWithAI: (
        message: string,
        options?: AIChatOptions
    ) => Promise<ChatResponse>;
}

interface ApiErrorResponse {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
    };
    message?: string;
    error?: string;
}

interface QuickPrompt {
    icon: React.ReactElement;
    label: string;
    prompt: string;
}

const COLORS = [
    '#6366f1',
    '#ec4899',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ef4444',
    '#14b8a6',
];

const aiLabApi = api as unknown as AILabApi;

const getErrorMessage = (error: unknown, fallback: string): string => {
    const apiError = error as ApiErrorResponse;

    return (
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        apiError?.error ||
        apiError?.message ||
        fallback
    );
};

const safeLoadChatHistory = (): ChatMessageItem[] => {
    try {
        const saved = localStorage.getItem('gemini_chatHistory');
        return saved ? (JSON.parse(saved) as ChatMessageItem[]) : [];
    } catch {
        return [];
    }
};

const safeLoadMode = (): AIMode => {
    const saved = localStorage.getItem('gemini_aiMode');
    return saved === 'statistical' || saved === 'conversation'
        ? saved
        : 'conversation';
};

const safeLoadSpeed = (): AISpeed => {
    const saved = localStorage.getItem('gemini_aiSpeed');
    return saved === 'planning' || saved === 'fast' ? saved : 'fast';
};

const parseAIResponse = (
    rawResponse: string
): {
    content: string;
    chart: AIChartData | null;
    suggestions: string[] | null;
} => {
    let content = rawResponse;
    let chart: AIChartData | null = null;
    let suggestions: string[] | null = null;

    const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/```json\r\n([\s\S]*?)\r\n```/) ||
        content.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
        return {
            content,
            chart,
            suggestions,
        };
    }

    try {
        const potentialJson = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(potentialJson) as {
            chart?: AIChartData;
            suggestions?: string[];
            type?: AIChartData['type'];
            title?: string;
            data?: ChartDataItem[];
        };

        if (parsed.chart || parsed.suggestions) {
            chart = parsed.chart ?? null;
            suggestions = parsed.suggestions ?? null;
            content = content.replace(jsonMatch[0], '').trim();
        } else if (parsed.type && parsed.data) {
            chart = {
                type: parsed.type,
                title: parsed.title,
                data: parsed.data,
            };

            content = content.replace(jsonMatch[0], '').trim();
        }
    } catch (error) {
        console.log('Found JSON but valid chart/suggestion data was not extracted.', error);
    }

    return {
        content,
        chart,
        suggestions,
    };
};

const renderChart = (chartData?: AIChartData | null) => {
    if (!chartData?.data?.length) return null;

    const CommonTooltip = ({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: Array<{ value?: number | string }>;
        label?: string;
    }) => {
        if (active && payload?.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>

                    <Typography variant="body2" fontWeight={700}>
                        {payload[0].value}
                    </Typography>
                </Box>
            );
        }

        return null;
    };

    if (chartData.type === 'pie') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData.data}
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.data.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>

                    <RechartsTooltip content={<CommonTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    if (chartData.type === 'line') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CommonTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="name"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CommonTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const ThemeLightningIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

const ThemeBrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);

const AILab = () => {
    const snackbar = useSnackbar() as unknown as SnackbarContextValue;
    const { showSnackbar } = snackbar;

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const [apiKey, setApiKey] = useState<string>('');
    const [hasApiKey, setHasApiKey] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [chatLoading, setChatLoading] = useState<boolean>(false);

    const [chatMessage, setChatMessage] = useState<string>('');
    const [chatHistory, setChatHistory] =
        useState<ChatMessageItem[]>(safeLoadChatHistory);

    const [aiMode, setAiMode] = useState<AIMode>(safeLoadMode);
    const [aiSpeed, setAiSpeed] = useState<AISpeed>(safeLoadSpeed);

    const [modeAnchorEl, setModeAnchorEl] = useState<HTMLElement | null>(null);
    const [speedAnchorEl, setSpeedAnchorEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        checkApiKey();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, chatLoading]);

    useEffect(() => {
        localStorage.setItem('gemini_chatHistory', JSON.stringify(chatHistory));
        localStorage.setItem('gemini_aiMode', aiMode);
        localStorage.setItem('gemini_aiSpeed', aiSpeed);
    }, [chatHistory, aiMode, aiSpeed]);

    const checkApiKey = async () => {
        try {
            const data = await aiLabApi.checkApiKey();
            setHasApiKey(Boolean(data.has_api_key));
        } catch (error) {
            console.error('Error checking API key:', error);
        }
    };

    const handleSaveApiKey = async () => {
        if (!apiKey.trim()) {
            showSnackbar('Please enter an API key', 'error');
            return;
        }

        try {
            setLoading(true);

            await aiLabApi.saveGeminiApiKey(apiKey.trim());

            setHasApiKey(true);
            setApiKey('');
            showSnackbar('API key saved successfully!', 'success');
        } catch (error: unknown) {
            showSnackbar(getErrorMessage(error, 'Failed to save API key'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        localStorage.removeItem('gemini_chatHistory');
        showSnackbar('Chat history cleared', 'success');
    };

    const handleSendMessage = async (text?: string) => {
        const messageToSend = typeof text === 'string' ? text : chatMessage;

        if (!messageToSend.trim() || chatLoading) return;

        const userMessage: ChatMessageItem = {
            role: 'user',
            content: messageToSend.trim(),
        };

        setChatHistory((previous) => [...previous, userMessage]);
        setChatMessage('');
        setChatLoading(true);

        try {
            const data = await aiLabApi.chatWithAI(messageToSend.trim(), {
                mode: aiMode,
                speed: aiSpeed,
            });

            const parsedResponse = parseAIResponse(data.response);

            const aiMessage: ChatMessageItem = {
                role: 'ai',
                content: parsedResponse.content,
                chart: parsedResponse.chart,
                suggestions: parsedResponse.suggestions,
            };

            setChatHistory((previous) => [...previous, aiMessage]);
        } catch (error: unknown) {
            showSnackbar(getErrorMessage(error, 'Failed to send message'), 'error');
        } finally {
            setChatLoading(false);
        }
    };

    const quickPrompts: QuickPrompt[] = [
        {
            icon: <TrendingUp />,
            label: 'How can I save more?',
            prompt: 'Based on my spending, what are the top 3 ways I can save more money?',
        },
        {
            icon: <Warning />,
            label: 'Budget warnings',
            prompt: "Are there any categories where I'm overspending?",
        },
        {
            icon: <Timeline />,
            label: 'Spending trends',
            prompt: 'What are my spending trends over the past month?',
        },
        {
            icon: <Insights />,
            label: 'Financial health',
            prompt: 'Give me an overall assessment of my financial health',
        },
    ];

    if (!hasApiKey) {
        return (
            <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
                <Card elevation={3}>
                    <CardContent sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 2,
                                    background:
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Psychology sx={{ fontSize: 32, color: 'white' }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" fontWeight={800} gutterBottom>
                                    AI Lab
                                </Typography>

                                <Typography variant="body1" color="text.secondary">
                                    Unlock powerful AI-driven financial insights
                                </Typography>
                            </Box>
                        </Box>

                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                ✨ 100% FREE - No Credit Card Required!
                            </Typography>

                            <Typography variant="body2">
                                This uses Google&apos;s free Gemini 2.5 Flash model
                                with generous limits:
                                <br />
                                • 15 requests per minute
                                <br />
                                • 1 million requests per day
                                <br />• Completely free forever!
                            </Typography>
                        </Alert>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Get your free API key in 30 seconds:{' '}
                            <Link
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener"
                                fontWeight={600}
                            >
                                Google AI Studio
                            </Link>
                        </Alert>

                        <TextField
                            fullWidth
                            label="Gemini API Key"
                            type="password"
                            value={apiKey}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setApiKey(event.target.value)
                            }
                            placeholder="Enter your Gemini API key"
                            InputProps={{
                                startAdornment: (
                                    <Key sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSaveApiKey}
                            disabled={loading}
                            startIcon={
                                loading ? <CircularProgress size={20} /> : <Key />
                            }
                            sx={{
                                background:
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                py: 1.5,
                            }}
                        >
                            {loading ? 'Saving...' : 'Activate AI Lab'}
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: { xs: 0, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 0, md: 2 },
                    scrollBehavior: 'smooth',
                }}
            >
                {chatHistory.length === 0 ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: 800,
                            mx: 'auto',
                            width: '100%',
                            px: { xs: 2, md: 0 },
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 56, md: 72 },
                                height: { xs: 56, md: 72 },
                                borderRadius: 4,
                                background:
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                boxShadow:
                                    '0 8px 24px rgba(102, 126, 234, 0.25)',
                            }}
                        >
                            <Psychology
                                sx={{
                                    fontSize: { xs: 32, md: 40 },
                                    color: 'white',
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h3"
                            fontWeight={800}
                            align="center"
                            sx={{
                                background:
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                fontSize: { xs: '1.75rem', md: '2.5rem' },
                            }}
                        >
                            Hello! I&apos;m SavvySave AI
                        </Typography>

                        <Typography
                            variant="h6"
                            color="text.secondary"
                            align="center"
                            sx={{
                                mb: 6,
                                fontWeight: 400,
                                fontSize: { xs: '0.95rem', md: '1.1rem' },
                            }}
                        >
                            How can I help you improve your finances today?
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'repeat(2, 1fr)',
                                },
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            {quickPrompts.map((item) => (
                                <Card
                                    key={item.label}
                                    elevation={0}
                                    onClick={() => handleSendMessage(item.prompt)}
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                                            borderColor: 'primary.light',
                                            transform: 'translateY(-2px)',
                                        },
                                        p: 2,
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            gutterBottom
                                        >
                                            {item.label}
                                        </Typography>

                                        <Box
                                            sx={{
                                                bgcolor: 'background.paper',
                                                p: 0.5,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                boxShadow:
                                                    '0 2px 4px rgba(0,0,0,0.05)',
                                                color: 'primary.main',
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        {item.prompt}
                                    </Typography>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%', pb: 2 }}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Button
                                size="small"
                                color="inherit"
                                onClick={handleClearChat}
                                startIcon={<Refresh fontSize="small" />}
                                sx={{ color: 'text.secondary' }}
                            >
                                Clear Chat
                            </Button>
                        </Box>

                        {chatHistory.map((message, index) => (
                            <Box
                                key={`${message.role}-${index}`}
                                sx={{
                                    mb: { xs: 3, md: 4 },
                                    px: { xs: 2, md: 0 },
                                    py: { xs: 1.5, md: 0 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems:
                                        message.role === 'user'
                                            ? 'flex-end'
                                            : 'flex-start',
                                }}
                            >
                                {message.role === 'ai' && (
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={1.5}
                                    >
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 2,
                                                background:
                                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow:
                                                    '0 2px 8px rgba(102, 126, 234, 0.2)',
                                            }}
                                        >
                                            <Psychology
                                                sx={{ fontSize: 18, color: 'white' }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                            sx={{
                                                fontSize: '0.85rem',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            SavvySave AI
                                        </Typography>
                                    </Box>
                                )}

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p:
                                            message.role === 'user'
                                                ? { xs: 1.5, md: 2 }
                                                : 0,
                                        px:
                                            message.role === 'user'
                                                ? { xs: 2.5, md: 3 }
                                                : 0,
                                        maxWidth:
                                            message.role === 'user'
                                                ? { xs: '85%', md: '75%' }
                                                : '100%',
                                        bgcolor:
                                            message.role === 'user'
                                                ? 'primary.main'
                                                : 'transparent',
                                        backgroundImage:
                                            message.role === 'user'
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'none',
                                        color:
                                            message.role === 'user'
                                                ? 'white'
                                                : 'text.primary',
                                        borderRadius:
                                            message.role === 'user' ? 3 : 0,
                                        boxShadow:
                                            message.role === 'user'
                                                ? '0 2px 8px rgba(102, 126, 234, 0.15)'
                                                : 'none',
                                        '& p': {
                                            m: 0,
                                            fontSize: {
                                                xs: '0.9rem',
                                                md: '0.95rem',
                                            },
                                            lineHeight: 1.7,
                                        },
                                        '& p + p': { mt: 1.5 },
                                        '& ul, & ol': { pl: 3, my: 1 },
                                        '& li': { mb: 0.5 },
                                        '& strong': {
                                            fontWeight: 600,
                                            color:
                                                message.role === 'user'
                                                    ? 'white'
                                                    : 'inherit',
                                        },
                                        '& a': {
                                            color:
                                                message.role === 'user'
                                                    ? 'white'
                                                    : 'primary.main',
                                            textDecoration: 'underline',
                                        },
                                        '& code': {
                                            bgcolor:
                                                message.role === 'user'
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : 'rgba(0,0,0,0.05)',
                                            px: 0.75,
                                            py: 0.25,
                                            borderRadius: 0.5,
                                            fontSize: '0.85em',
                                        },
                                    }}
                                >
                                    <ReactMarkdown>{message.content}</ReactMarkdown>

                                    {message.chart && (
                                        <Box
                                            sx={{
                                                mt: 3,
                                                mb: 1,
                                                p: 2,
                                                bgcolor: 'background.paper',
                                                borderRadius: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                boxShadow:
                                                    '0 2px 12px rgba(0,0,0,0.03)',
                                            }}
                                        >
                                            <Typography
                                                variant="overline"
                                                fontWeight={700}
                                                color="text.secondary"
                                                gutterBottom
                                                display="block"
                                                sx={{ letterSpacing: 1 }}
                                            >
                                                {message.chart.title?.toUpperCase() ||
                                                    'VISUALIZATION'}
                                            </Typography>

                                            <Divider sx={{ mb: 2 }} />

                                            <Box
                                                sx={{
                                                    height: 300,
                                                    width: '100%',
                                                    minWidth: { xs: 0, sm: 300 },
                                                }}
                                            >
                                                {renderChart(message.chart)}
                                            </Box>
                                        </Box>
                                    )}

                                    {message.suggestions &&
                                        message.suggestions.length > 0 && (
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                }}
                                            >
                                                {message.suggestions.map(
                                                    (suggestion) => (
                                                        <Chip
                                                            key={suggestion}
                                                            label={suggestion}
                                                            icon={
                                                                <AutoGraph fontSize="small" />
                                                            }
                                                            onClick={() =>
                                                                handleSendMessage(
                                                                    suggestion
                                                                )
                                                            }
                                                            sx={{
                                                                cursor: 'pointer',
                                                                bgcolor:
                                                                    'rgba(102, 126, 234, 0.08)',
                                                                color: 'primary.main',
                                                                fontWeight: 500,
                                                                border: '1px solid',
                                                                borderColor:
                                                                    'rgba(102, 126, 234, 0.2)',
                                                                '&:hover': {
                                                                    bgcolor:
                                                                        'primary.main',
                                                                    color: 'white',
                                                                    borderColor:
                                                                        'primary.main',
                                                                    '& .MuiChip-icon':
                                                                        {
                                                                            color: 'white',
                                                                        },
                                                                },
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        )}
                                </Paper>
                            </Box>
                        ))}

                        {chatLoading && (
                            <Box display="flex" alignItems="center" gap={2} px={2}>
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 1,
                                        background:
                                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CircularProgress
                                        size={14}
                                        sx={{ color: 'white' }}
                                    />
                                </Box>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontStyle: 'italic' }}
                                >
                                    Thinking...
                                </Typography>
                            </Box>
                        )}

                        <div ref={chatEndRef} />
                    </Box>
                )}
            </Box>

            <Box
                sx={{
                    p: { xs: 0, md: 3 },
                    px: { xs: 0, md: 3 },
                    pb: { xs: 2 },
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Box
                    component="form"
                    onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleSendMessage();
                    }}
                    sx={{
                        p: '1px 5px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: { xs: '100%', md: 900 },
                        borderRadius: 50,
                        border: '1.5px solid',
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(255,255,255,0.9)',
                        borderColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(102, 126, 234, 0.3)'
                                    : 'rgba(102, 126, 234, 0.2)',
                            boxShadow:
                                '0 4px 16px rgba(102, 126, 234, 0.12)',
                        },
                        '&:focus-within': {
                            borderColor: 'primary.main',
                            boxShadow:
                                '0 4px 20px rgba(102, 126, 234, 0.2)',
                        },
                    }}
                >
                    <Tooltip
                        title={`Current Mode: ${
                            aiMode.charAt(0).toUpperCase() + aiMode.slice(1)
                        }`}
                    >
                        <IconButton
                            sx={{ p: '10px', ml: 0.5 }}
                            onClick={(event: React.MouseEvent<HTMLElement>) =>
                                setModeAnchorEl(event.currentTarget)
                            }
                        >
                            {aiMode === 'conversation' ? (
                                <Psychology color="action" />
                            ) : (
                                <BarChartIcon color="primary" />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={modeAnchorEl}
                        open={Boolean(modeAnchorEl)}
                        onClose={() => setModeAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
                    >
                        <MenuItem
                            onClick={() => {
                                setAiMode('conversation');
                                setModeAnchorEl(null);
                            }}
                            selected={aiMode === 'conversation'}
                        >
                            <ListItemIcon>
                                <Psychology fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Conversation"
                                secondary="Friendly, casual assistant"
                            />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                setAiMode('statistical');
                                setModeAnchorEl(null);
                            }}
                            selected={aiMode === 'statistical'}
                        >
                            <ListItemIcon>
                                <BarChartIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Statistical"
                                secondary="Data-focused analyst"
                            />
                        </MenuItem>
                    </Menu>

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ height: 28, m: 0.5 }}
                    />

                    <Tooltip
                        title={`Speed: ${
                            aiSpeed === 'fast' ? 'Fast' : 'Deep Thought'
                        }`}
                    >
                        <IconButton
                            sx={{ p: '10px' }}
                            onClick={(event: React.MouseEvent<HTMLElement>) =>
                                setSpeedAnchorEl(event.currentTarget)
                            }
                        >
                            {aiSpeed === 'fast' ? (
                                <ThemeLightningIcon />
                            ) : (
                                <ThemeBrainIcon />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={speedAnchorEl}
                        open={Boolean(speedAnchorEl)}
                        onClose={() => setSpeedAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
                    >
                        <MenuItem
                            onClick={() => {
                                setAiSpeed('fast');
                                setSpeedAnchorEl(null);
                            }}
                            selected={aiSpeed === 'fast'}
                        >
                            <ListItemIcon>
                                <ThemeLightningIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Fast"
                                secondary="Standard speed (Flash)"
                            />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                setAiSpeed('planning');
                                setSpeedAnchorEl(null);
                            }}
                            selected={aiSpeed === 'planning'}
                        >
                            <ListItemIcon>
                                <ThemeBrainIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Deep Thought"
                                secondary="Plans before answering"
                            />
                        </MenuItem>
                    </Menu>

                    <TextField
                        sx={{ flex: 1, ml: 1 }}
                        placeholder={`Ask in ${aiMode} mode...`}
                        variant="standard"
                        multiline
                        maxRows={6}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: { xs: '0.9rem', md: '1rem' } },
                        }}
                        value={chatMessage}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            setChatMessage(event.target.value)
                        }
                        disabled={chatLoading}
                        onKeyDown={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />

                    {chatMessage.trim() && (
                        <IconButton
                            type="button"
                            sx={{ p: '10px', mr: 0.5, color: 'primary.main' }}
                            aria-label="send"
                            onClick={() => handleSendMessage()}
                            disabled={chatLoading}
                        >
                            <Send />
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default AILab;