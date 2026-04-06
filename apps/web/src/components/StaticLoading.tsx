import { Loader2 } from 'lucide-react';

export default function StaticLoading() {
  return (
    <div className="bg-background/90 fixed top-0 right-1/2 z-9999 flex h-full w-full max-w-md translate-x-1/2 items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}
