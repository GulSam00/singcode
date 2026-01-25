import { useEffect, useState } from 'react';

export const useCheckInTimer = (serverTime: Date | null) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!serverTime) return;

    const timer = setInterval(() => {
      const now = new Date(); // Current local time as proxy for server time in loop

      // Calculate KST times
      // UTC+9
      const kstOffset = 9 * 60 * 60 * 1000;
      const nowKst = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + kstOffset);

      // Tomorrow 00:00 KST
      const tomorrowKst = new Date(nowKst);
      tomorrowKst.setDate(tomorrowKst.getDate() + 1);
      tomorrowKst.setHours(0, 0, 0, 0);

      const diff = tomorrowKst.getTime() - nowKst.getTime();

      if (diff < 0) {
        // Should ideally reset
        setTimeRemaining('00:00:00');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [serverTime]);

  return timeRemaining;
};
