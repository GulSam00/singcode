'use client';

import { useEffect, useState } from 'react';

export default function DisquietBadge() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <iframe
        title="disquiet-badge"
        src="https://badge.disquiet.io/vote-badge?productUrlSlug=singcode&mode=light"
        className="w-full"
      />
    </div>
  );
}
