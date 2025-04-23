import { create } from 'zustand';

type MessageVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ModalState {
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

const useModalStore = create<ModalState>(set => ({
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

export default useModalStore;
