'use client';

import { useState } from 'react';

interface Block {
  id: number;
  content: string;
}

export default function HomePage() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 1, content: '블록 1' },
    { id: 2, content: '블록 2' },
    { id: 3, content: '블록 3' },
    { id: 4, content: '블록 4' },
  ]);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }
    setBlocks(newBlocks);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">블록 순서 변경</h1>
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="relative flex items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg"
            >
              {/* 블록 내용 */}
              <div className="flex-grow text-gray-700">{block.content}</div>
              
              {/* 컨트롤 버튼 */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className={`rounded p-1 transition-colors
                    ${
                      index === 0
                        ? 'cursor-not-allowed text-gray-300'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="위로 이동"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className={`rounded p-1 transition-colors
                    ${
                      index === blocks.length - 1
                        ? 'cursor-not-allowed text-gray-300'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="아래로 이동"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}