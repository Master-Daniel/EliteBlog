import { createTheme } from "react-data-table-component";

let themesInitialized = false;

export const initDataTableThemes = () => {
    if (themesInitialized) return;
    themesInitialized = true;
    
    createTheme('lightTheme', {
        text: {
            primary: '#111827',
            secondary: '#4b5563',
        },
        background: {
            default: '#ffffff',
        },
        context: {
            background: '#f3f4f6',
            text: '#111827',
        },
        divider: {
            default: '#e5e7eb',
        },
        button: {
            default: '#6b7280',
            hover: 'rgba(0,0,0,.05)',
            focus: 'rgba(0,0,0,.1)',
            disabled: 'rgba(0,0,0,.2)',
        },
        sortFocus: {
            default: '#3b82f6',
        },
        highlightOnHover: {
            default: '#f9fafb',
            text: '#111827',
        },
        striped: {
            default: '#f9fafb',
            text: '#111827',
        },
    }, 'light');

    createTheme('darkTheme', {
        text: {
            primary: '#f9fafb',
            secondary: '#9ca3af',
        },
        background: {
            default: '#1f2937',
        },
        context: {
            background: '#374151',
            text: '#ffffff',
        },
        divider: {
            default: '#374151',
        },
        button: {
            default: '#9ca3af',
            hover: 'rgba(255,255,255,.08)',
            focus: 'rgba(255,255,255,.12)',
            disabled: 'rgba(255,255,255,.2)',
        },
        sortFocus: {
            default: '#60a5fa',
        },
        highlightOnHover: {
            default: '#374151',
            text: '#ffffff',
        },
        striped: {
            default: '#111827',
            text: '#f9fafb',
        },
    }, 'dark');
};

export const getDataTableTheme = (theme: string): string => {
    initDataTableThemes();
    return theme === 'dark' ? 'darkTheme' : 'lightTheme';
};
