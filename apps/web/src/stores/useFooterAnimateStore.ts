import { create } from 'zustand';

export type FooterKey = 'SEARCH' | 'RECENT' | 'TOSING' | 'POPULAR' | 'INFO' | null;

interface FooterStore {
  footerAnimateKey: FooterKey;
  setFooterAnimateKey: (key: FooterKey) => void;
}

const initialState = {
  footerAnimateKey: null,
};

const useFooterAnimateStore = create<FooterStore>(set => ({
  ...initialState,

  setFooterAnimateKey: key => {
    set({ footerAnimateKey: key });
    setTimeout(() => {
      set({ footerAnimateKey: null });
    }, 300);
  },
}));

export default useFooterAnimateStore;
