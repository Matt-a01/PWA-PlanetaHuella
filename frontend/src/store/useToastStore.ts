import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  mostrarToast: (message: string, type?: ToastType) => void;
  ocultarToast: (id: string) => void;
}

const DURACION_TOAST_MS = 3500;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  mostrarToast: (message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, DURACION_TOAST_MS);
  },

  ocultarToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
