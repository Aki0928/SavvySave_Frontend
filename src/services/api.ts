const API_BASE_URL = 'http://127.0.0.1:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;
type ApiHeaders = Record<string, string>;

interface ApiFetchOptions extends Omit<RequestInit, 'headers' | 'body' | 'method'> {
    method?: HttpMethod;
    headers?: ApiHeaders;
    body?: BodyInit | null;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

type Id = string | number;

// ============ EXPORTED INTERFACES (magamit sa ubang files) ============
export interface User {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface LoginResponse {
    api_token: string;
    user: User;
}

export interface RegisterResponse {
    api_token: string;
    user: User;
}

export interface Transaction {
    id: number;
    amount: number;
    category_id: number;
    category_name: string;
    note?: string;
    type: 'income' | 'expense';
    date: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    user_id?: number;
}

export interface DashboardData {
    total_income: number;
    total_expense: number;
    balance: number;
    recent_transactions: Transaction[];
}

export interface Budget {
    id: number;
    category_id: number;
    category_name: string;
    amount: number;
    spent: number;
    remaining: number;
    month: string;
    year: number;
}

export interface AIInsight {
    id?: number;
    title: string;
    description: string;
    type: 'warning' | 'info' | 'success' | 'tip';
    actionable?: boolean;
    action_url?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface ChatResponse {
    message: string;
    conversation_id?: string;
}
// =========================================================================

// ============ INTERNAL PAYLOAD INTERFACES (dili exported) ============
interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface CategoryPayload {
    name: string;
    type: 'income' | 'expense';
    color?: string;
}

interface TransactionPayload {
    amount: number;
    category_id: number;
    note?: string;
    type: 'income' | 'expense';
    date: string;
}

interface UserPayload {
    name: string;
    email: string;
    is_admin?: boolean;
}

interface BudgetPayload {
    category_id: Id;
    amount: number;
    month?: string;
    year?: string | number;
}

interface ProfilePayload {
    name: string;
    email: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
}

interface ChatOptions {
    mode?: 'conversation' | 'statistical';
    speed?: 'fast' | 'planning';
}
// =========================================================================

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? null;
    }

    return null;
};

const getToken = (): string | null => {
    return getCookie('api_token');
};

const buildQueryString = (params: QueryParams = {}): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};

const apiFetch = async <T = unknown>(
    endpoint: string,
    options: ApiFetchOptions = {}
): Promise<T> => {
    const token = getToken();

    const headers: ApiHeaders = {
        Accept: 'application/json',
        ...options.headers,
    };

    const hasBody = Boolean(options.body);

    if (hasBody && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        const contentType = response.headers.get('content-type');
        const hasJson = contentType?.includes('application/json');

        const data = hasJson
            ? ((await response.json()) as T & ApiErrorResponse)
            : null;

        if (!response.ok) {
            const message =
                data?.message ||
                data?.error ||
                `API request failed with status ${response.status}`;

            throw new Error(message);
        }

        return data as T;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }

        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('API Error:', error);
        }

        throw error;
    }
};

export const api = {
    // ============ AUTHENTICATION ============
    register: async <T = RegisterResponse>(
        name: string,
        email: string,
        password: string
    ): Promise<T> => {
        const payload: RegisterPayload = {
            name,
            email,
            password,
        };

        return apiFetch<T>('/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    login: async <T = LoginResponse>(
        email: string,
        password: string
    ): Promise<T> => {
        const payload: LoginPayload = {
            email,
            password,
        };

        return apiFetch<T>('/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    logout: async <T = { message: string }>(): Promise<T> => {
        return apiFetch<T>('/logout', {
            method: 'POST',
        });
    },

    getUser: async <T = User>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/user', options);
    },

    updateProfile: async <T = User>(
        data: ProfilePayload
    ): Promise<T> => {
        return apiFetch<T>('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // ============ DASHBOARD & TRANSACTIONS ============
    getDashboard: async <T = DashboardData>(
        params: QueryParams = {},
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `/dashboard?${queryString}`
            : '/dashboard';

        return apiFetch<T>(endpoint, options);
    },

    getTransactions: async <T = { data: Transaction[]; meta?: any }>(
        params: QueryParams = {},
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `/transactions?${queryString}`
            : '/transactions';

        return apiFetch<T>(endpoint, options);
    },

    createTransaction: async <T = Transaction>(
        data: TransactionPayload
    ): Promise<T> => {
        return apiFetch<T>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateTransaction: async <T = Transaction>(
        id: Id,
        data: TransactionPayload
    ): Promise<T> => {
        return apiFetch<T>(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteTransaction: async <T = { message: string }>(id: Id): Promise<T> => {
        return apiFetch<T>(`/transactions/${id}`, {
            method: 'DELETE',
        });
    },

    // ============ CATEGORIES ============
    getCategories: async <T = Category[]>(
        type: 'income' | 'expense' | null = null,
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = type ? `?type=${type}` : '';

        return apiFetch<T>(`/categories${queryString}`, options);
    },

    createCategory: async <T = Category>(
        data: CategoryPayload
    ): Promise<T> => {
        return apiFetch<T>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateCategory: async <T = Category>(
        id: Id,
        data: CategoryPayload
    ): Promise<T> => {
        return apiFetch<T>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteCategory: async <T = { message: string }>(id: Id): Promise<T> => {
        return apiFetch<T>(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    // ============ USER MANAGEMENT (Admin) ============
    getUsers: async <T = { data: User[]; meta?: any }>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/users', options);
    },

    updateUser: async <T = User>(
        id: Id,
        data: UserPayload
    ): Promise<T> => {
        return apiFetch<T>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    toggleUserStatus: async <T = User>(id: Id): Promise<T> => {
        return apiFetch<T>(`/users/${id}/toggle-status`, {
            method: 'POST',
        });
    },

    // ============ BUDGETS ============
    getBudgets: async <T = Budget[]>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/budgets', options);
    },

    setBudget: async <T = Budget>(data: BudgetPayload): Promise<T> => {
        return apiFetch<T>('/budgets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deleteBudget: async <T = { message: string }>(id: Id): Promise<T> => {
        return apiFetch<T>(`/budgets/${id}`, {
            method: 'DELETE',
        });
    },

    // ============ AI / GEMINI FEATURES ============
    saveGeminiApiKey: async <T = { message: string }>(
        apiKey: string
    ): Promise<T> => {
        return apiFetch<T>('/ai/api-key', {
            method: 'POST',
            body: JSON.stringify({
                api_key: apiKey,
            }),
        });
    },

    checkApiKey: async <T = { has_key: boolean; valid?: boolean }>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/check-key', options);
    },

    getAIInsights: async <T = AIInsight[]>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/insights', options);
    },

    analyzeSpending: async <T = { analysis: string; recommendations: string[] }>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/analyze', {
            method: 'POST',
            ...options,
        });
    },

    getBudgetRecommendations: async <T = { recommendations: Budget[]; message: string }>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/budget-recommendations', options);
    },

    chatWithAI: async <T = ChatResponse>(
        message: string,
        options: ChatOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                ...options,
            }),
        });
    },
};