import createWebStorage from "redux-persist/lib/storage/createWebStorage";

type NoopStorage = {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
};

const createNoopStorage = (): NoopStorage => {
    return {
        getItem(_key: string): Promise<string | null> {
            return Promise.resolve(null);
        },
        setItem(_key: string, _value: string): Promise<void> {
            return Promise.resolve();
        },
        removeItem(_key: string): Promise<void> {
            return Promise.resolve();
        },
    };
};

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export default storage;
