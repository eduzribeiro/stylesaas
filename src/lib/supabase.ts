import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

console.log('Iniciando cliente Supabase...');

/// <reference types="vite/client" />

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env file.\n' +
        'Required variables:\n' +
        '- VITE_SUPABASE_URL\n' +
        '- VITE_SUPABASE_ANON_KEY'
    );
}
const locks: Record<string, Promise<void>> = {};

const memoryLock = async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
    const previousPromise = locks[name] || Promise.resolve();

    let releaseLock!: () => void;
    locks[name] = previousPromise.then(() => new Promise<void>(resolve => {
        releaseLock = resolve;
    }));

    try {
        await previousPromise;
        return await fn();
    } finally {
        releaseLock();

        // Minor cleanup: if we are the only pending lock, we can optionally clear it.
        // It's safe to just let the resolved promise sit in memory too, as it gets overwritten on next acquire.
    }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'nutrisaas-v2-auth',
        storage: window.localStorage,
        // Safe lock to bypass the navigator.locks API without breaking concurrency
        lock: memoryLock,
    },
});

// Helper to handle Supabase errors
export function handleSupabaseError(error: any): never {
    console.error('Supabase Error:', error);

    if (error.message) {
        throw new Error(error.message);
    }

    if (error.error_description) {
        throw new Error(error.error_description);
    }

    throw new Error('Ocorreu um erro inesperado. Tente novamente.');
}

// Helper to check if user is authenticated
export async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        handleSupabaseError(error);
    }

    return session;
}

// Helper to get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        handleSupabaseError(error);
    }

    return user;
}
