'use client';

import { useState } from 'react';

import { ChatResponseType, safeParseJson } from '@/utils/safeParseJson';

import { MusicCard } from './MusicCard';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendation, setRecommendation] = useState<ChatResponseType | null>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setRecommendation(null);
    setIsLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    const data = await res.json();

    const parsedData = safeParseJson(data.content);

    if (!parsedData) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '오류가 발생했어요. 다시 시도해 주세요.',
        },
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: parsedData.intro,
        },
      ]);
    }
    setRecommendation(parsedData);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-4 py-6">
      <h1 className="mb-4 text-center text-xl font-semibold">LLM 채팅 실습</h1>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            지금 기분이나 상황을 편하게 말해보세요.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'mr-auto bg-white text-gray-800 shadow'
              }`}
            >
              {msg.content}
            </div>
          ))}

          {recommendation && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {recommendation.recommendations.map((music, idx) => (
                <MusicCard
                  key={idx}
                  title={music.title}
                  artist={music.artist}
                  reason={music.reason}
                />
              ))}
            </div>
          )}

          {isLoading && (
            <div className="mr-auto max-w-[60%] rounded-lg bg-white px-4 py-2 text-sm text-gray-400 shadow">
              AI가 생각 중이에요…
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={2}
          maxLength={100}
          placeholder="오늘 기분이나 듣고 싶은 분위기를 적어보세요"
          className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  );
}
