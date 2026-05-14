const STORAGE_KEYS = {
    USERS: 'savvy_users',
    CURRENT_USER: 'savvy_current_user',
    DATA: 'savvy_data_',
} as const;

export type UserId = string | number;

export interface StorageUser {
    id: UserId;
    name?: string;
    email: string;
    password: string;
    is_admin?: boolean;
    is_active?: boolean;
    created_at?: string;
}

export type TransactionType = 'income' | 'expense';

export interface StorageTransaction {
    id?: UserId;
    amount: number;
    category?: string;
    category_id?: UserId;
    type: TransactionType;
    note?: string;
    date?: string;
    timestamp?: string;
}

export interface UserBudget {
    [key: string]: number;
}

export interface UserData {
    transactions: StorageTransaction[];
    budget: UserBudget;
}

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
    if (!value) return fallback;

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

export const storage = {
    getUsers: (): StorageUser[] => {
        return safeJsonParse<StorageUser[]>(
            localStorage.getItem(STORAGE_KEYS.USERS),
            []
        );
    },

    saveUser: (user: StorageUser): void => {
        const users = storage.getUsers();

        const emailExists = users.some(
            (existingUser) => existingUser.email === user.email
        );

        if (emailExists) {
            throw new Error('User already exists');
        }

        users.push(user);

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    login: (email: string, password: string): StorageUser => {
        const users = storage.getUsers();

        const user = users.find(
            (existingUser) =>
                existingUser.email === email &&
                existingUser.password === password
        );

        if (!user) {
            throw new Error('Invalid credentials');
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        return user;
    },

    logout: (): void => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    getCurrentUser: (): StorageUser | null => {
        return safeJsonParse<StorageUser | null>(
            localStorage.getItem(STORAGE_KEYS.CURRENT_USER),
            null
        );
    },

    getUserData: (userId: UserId): UserData => {
        const key = `${STORAGE_KEYS.DATA}${userId}`;

        const data = safeJsonParse<UserData>(localStorage.getItem(key), {
            transactions: [],
            budget: {},
        });

        return {
            transactions: Array.isArray(data.transactions)
                ? data.transactions
                : [],
            budget: data.budget ?? {},
        };
    },

    saveTransaction: (
        userId: UserId,
        transaction: Omit<StorageTransaction, 'id' | 'timestamp'>
    ): UserData => {
        const data = storage.getUserData(userId);

        const newTransaction: StorageTransaction = {
            ...transaction,
            id: Date.now(),
            timestamp: new Date().toISOString(),
        };

        const updatedData: UserData = {
            ...data,
            transactions: [...data.transactions, newTransaction],
        };

        localStorage.setItem(
            `${STORAGE_KEYS.DATA}${userId}`,
            JSON.stringify(updatedData)
        );

        return updatedData;
    },

    getTransactions: (userId: UserId): StorageTransaction[] => {
        const data = storage.getUserData(userId);

        return data.transactions;
    },
};