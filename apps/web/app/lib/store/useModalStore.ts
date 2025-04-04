import { create } from 'zustand';

export type MessageVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ModalState {
  isOpen: boolean;
  title?: string;
  message: string;
  variant: MessageVariant;
  buttonText?: string;
  onButtonClick?: () => void;

  // 액션
  openMessage: (props: {
    title?: string;
    message: string;
    variant?: MessageVariant;
    buttonText?: string;
    onButtonClick?: () => void;
  }) => void;
  closeMessage: () => void;
}

export const useModalStore = create<ModalState>(set => ({
  isOpen: false,
  title: undefined,
  message: '',
  variant: 'default',
  buttonText: undefined,
  onButtonClick: undefined,
  // onButtonClick 없어도 closeMessage는 기본적으로 호출 된다

  openMessage: ({ title, message, variant = 'default', buttonText, onButtonClick }) => {
    set({
      isOpen: true,
      title,
      message,
      variant,
      buttonText,
      onButtonClick,
    });
  },

  closeMessage: () => {
    set({ isOpen: false });
  },
}));
