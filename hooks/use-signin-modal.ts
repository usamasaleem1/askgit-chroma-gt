import { create } from 'zustand';

interface ModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSigninModal = create<ModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useTokenModal = create<ModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useLogoutModal = create<ModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));