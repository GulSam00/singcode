import { create } from 'zustand';

export type FooterKey = 'SEARCH' | 'RECENT' | 'TOSING' | 'POPULAR' | 'INFO' | null;

interface FooterStore {
  activeFooterItem: FooterKey;
  triggerFooterAnimation: (key: FooterKey) => void;
}

const initialState = {
  activeFooterItem: null,
};

const useFooterAnimateStore = create<FooterStore>(set => ({
  ...initialState,

  triggerFooterAnimation: key => {
    set({ activeFooterItem: key });
    setTimeout(() => {
      set({ activeFooterItem: null });
    }, 300);
  },
}));

export default useFooterAnimateStore;
