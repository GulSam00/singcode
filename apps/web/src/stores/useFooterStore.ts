import { create } from 'zustand';

interface FooterStore {
  activeFooterItem: string | null;
  triggerFooterAnimation: (href: string) => void;
}

export const useFooterStore = create<FooterStore>(set => ({
  activeFooterItem: null,
  triggerFooterAnimation: href => {
    set({ activeFooterItem: href });
    setTimeout(() => {
      set({ activeFooterItem: null });
    }, 300);
  },
}));
