import { useState, useEffect, useCallback } from 'react';

interface ApiHookState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useApi<T>(fetchFunction: () => Promise<T>, dependencies: any[] = []) {
    const [state, setState] = useState<ApiHookState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null });

        try {
            const data = await fetchFunction();
            setState({ data, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
        }
    }, [fetchFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData, ...dependencies]);

    // Function to manually refetch data
    const refetch = () => {
        fetchData();
    };

    return { ...state, refetch };
}