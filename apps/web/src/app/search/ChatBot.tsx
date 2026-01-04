'use client';

import { Bot, Loader2, RefreshCcw, Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { type ChatMessage, postOpenAIChat } from '@/lib/api/openAIchat';
import { ChatResponseType, safeParseJson } from '@/utils/safeParseJson';

import { MusicCard } from './MusicCard';

interface ChatBotProps {
  messages: ChatMessage[];
  recommendation: ChatResponseType | null;
  setInputSearch: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setRecommendation: React.Dispatch<React.SetStateAction<ChatResponseType | null>>;
}

export function ChatBot({
  messages,
  recommendation,
  setInputSearch,
  setMessages,
  setRecommendation,
}: ChatBotProps) {
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

    try {
      const data = await postOpenAIChat([...messages, userMessage]);

      if (!data.content) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '오류가 발생했어요. 다시 시도해 주세요.',
          },
        ]);
        setIsLoading(false);
        return;
      }

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
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '오류가 발생했어요. 다시 시도해 주세요.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setRecommendation(null);
    setInput('');
  };

  const handleClickInputSearch = (value: string) => {
    setInputSearch(value);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 메시지 영역 */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center">
              <Bot className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground text-center text-sm">
                지금 기분이나 상황을 편하게 말해보세요.
                <br />
                AI가 맞는 노래를 추천해드릴게요!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Bot className="text-primary h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <div className="bg-primary h-4 w-4 rounded-full" />
                  </div>
                )}
              </div>
            ))}

            {recommendation && recommendation.recommendations.length > 0 && (
              <div className="mt-2 flex flex-col gap-3">
                {recommendation.recommendations.map((music, idx) => (
                  <MusicCard
                    key={idx}
                    title={music.title}
                    artist={music.artist}
                    reason={music.reason}
                    onClick={handleClickInputSearch}
                  />
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-4 w-4" />
                </div>
                <div className="bg-muted text-muted-foreground max-w-[60%] rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI가 생각 중이에요…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* 입력 영역 */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            placeholder="오늘 기분이나 듣고 싶은 분위기를 적어보세요"
            className="h-9 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>

          {/* 초기화 버튼 */}
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
