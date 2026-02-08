import { create } from 'zustand';

export type FooterKey = 'SEARCH' | 'RECENT' | 'TOSING' | 'POPULAR' | 'INFO' | null;

interface FooterStore {
  footerAnimateKey: FooterKey;
  timeoutId: ReturnType<typeof setTimeout> | null;
  setFooterAnimateKey: (key: FooterKey) => void;
}

const initialState = {
  footerAnimateKey: null,
  timeoutId: null,
};

const useFooterAnimateStore = create<FooterStore>((set, get) => ({
  ...initialState,

  setFooterAnimateKey: key => {
    const { timeoutId } = get();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({ footerAnimateKey: key });

    const newTimeoutId = setTimeout(() => {
      set({ footerAnimateKey: null, timeoutId: null });
    }, 300);

    set({ timeoutId: newTimeoutId });
  },
}));

export default useFooterAnimateStore;
