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
    register: async <T = unknown>(
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

    login: async <T = unknown>(
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

    logout: async <T = unknown>(): Promise<T> => {
        return apiFetch<T>('/logout', {
            method: 'POST',
        });
    },

    getDashboard: async <T = unknown>(
        params: QueryParams = {},
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `/dashboard?${queryString}`
            : '/dashboard';

        return apiFetch<T>(endpoint, options);
    },

    getTransactions: async <T = unknown>(
        params: QueryParams = {},
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `/transactions?${queryString}`
            : '/transactions';

        return apiFetch<T>(endpoint, options);
    },

    createTransaction: async <T = unknown>(
        data: TransactionPayload
    ): Promise<T> => {
        return apiFetch<T>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateTransaction: async <T = unknown>(
        id: Id,
        data: TransactionPayload
    ): Promise<T> => {
        return apiFetch<T>(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteTransaction: async <T = unknown>(id: Id): Promise<T> => {
        return apiFetch<T>(`/transactions/${id}`, {
            method: 'DELETE',
        });
    },

    getUser: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/user', options);
    },

    getCategories: async <T = unknown>(
        type: 'income' | 'expense' | null = null,
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        const queryString = type ? `?type=${type}` : '';

        return apiFetch<T>(`/categories${queryString}`, options);
    },

    createCategory: async <T = unknown>(
        data: CategoryPayload
    ): Promise<T> => {
        return apiFetch<T>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateCategory: async <T = unknown>(
        id: Id,
        data: CategoryPayload
    ): Promise<T> => {
        return apiFetch<T>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteCategory: async <T = unknown>(id: Id): Promise<T> => {
        return apiFetch<T>(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    getUsers: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/users', options);
    },

    updateUser: async <T = unknown>(
        id: Id,
        data: UserPayload
    ): Promise<T> => {
        return apiFetch<T>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    toggleUserStatus: async <T = unknown>(id: Id): Promise<T> => {
        return apiFetch<T>(`/users/${id}/toggle-status`, {
            method: 'POST',
        });
    },

    getBudgets: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/budgets', options);
    },

    setBudget: async <T = unknown>(data: BudgetPayload): Promise<T> => {
        return apiFetch<T>('/budgets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deleteBudget: async <T = unknown>(id: Id): Promise<T> => {
        return apiFetch<T>(`/budgets/${id}`, {
            method: 'DELETE',
        });
    },

    updateProfile: async <T = unknown>(
        data: ProfilePayload
    ): Promise<T> => {
        return apiFetch<T>('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    saveGeminiApiKey: async <T = unknown>(
        apiKey: string
    ): Promise<T> => {
        return apiFetch<T>('/ai/api-key', {
            method: 'POST',
            body: JSON.stringify({
                api_key: apiKey,
            }),
        });
    },

    checkApiKey: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/check-key', options);
    },

    getAIInsights: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/insights', options);
    },

    analyzeSpending: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/analyze', {
            method: 'POST',
            ...options,
        });
    },

    getBudgetRecommendations: async <T = unknown>(
        options: ApiFetchOptions = {}
    ): Promise<T> => {
        return apiFetch<T>('/ai/budget-recommendations', options);
    },

    chatWithAI: async <T = unknown>(
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