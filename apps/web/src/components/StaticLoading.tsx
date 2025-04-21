import { Loader2 } from 'lucide-react';

export default function StaticLoading() {
  return (
    <div className="fixed top-0 z-[9999] flex h-full w-[360px] items-center justify-center bg-white/90">
      {/* <div className="border-secondary border-t-primary h-12 w-12 animate-spin rounded-full border-4" /> */}
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}
