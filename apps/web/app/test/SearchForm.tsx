'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  initialSinger?: string;
}

export function SearchForm({ initialSinger = '' }: SearchFormProps) {
  const router = useRouter();
  const [singer, setSinger] = useState(initialSinger);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // URL 쿼리 파라미터 업데이트
    if (singer) {
      router.push(`/test?search=${encodeURIComponent(singer)}`);
    } else {
      router.push('/test');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={singer}
          onChange={e => setSinger(e.target.value)}
          placeholder="가수 이름을 입력하세요"
          className="flex-1 rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          검색
        </button>
      </div>
    </form>
  );
}
