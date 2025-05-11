import { create } from 'zustand';

import { getMessageReactNode } from '@/utils/getMessageReactNode';

type MessageVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ModalState {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  variant: MessageVariant;
  buttonText?: string;
  onButtonClick?: () => void;

  // 액션
  openMessage: (props: {
    title?: string;
    message: React.ReactNode;
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
    const messageReactNode: React.ReactNode = getMessageReactNode(message);
    set({
      isOpen: true,
      title,
      message: messageReactNode,
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
