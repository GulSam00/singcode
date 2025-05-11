import { useEffect, useState } from 'react';

import useModalStore from '@/stores/useModalStore';

export default function useVersionDialog() {
  const { openMessage } = useModalStore();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const initVersion = async () => {
      const response = await fetch('/api/version');
      if (!response.ok) {
        console.error('Failed to fetch version');
        return;
      }

      const { version } = await response.json();
      setVersion(version);

      const changelogRes = await fetch('/changelog.json');
      const changelogs = await changelogRes.json();

      const localVersion = localStorage.getItem('version');
      if (!localVersion || localVersion !== version) {
        const title = changelogs[version]?.title || '새로운 버전';
        const message = changelogs[version]?.message || ['업데이트된 내용을 수정중입니다.'];

        localStorage.setItem('version', version);
        openMessage({
          title,
          message,
          variant: 'info',
        });
      }
    };
    initVersion();
  }, [openMessage]);

  return { version };
}
