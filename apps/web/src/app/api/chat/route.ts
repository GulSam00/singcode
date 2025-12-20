import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    console.log('messages : ', messages);

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: '너는 사용자와 자연스럽게 대화하는 친절한 챗봇이다.',
        },
        ...messages,
      ],
    });

    return NextResponse.json({
      content: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: 'LLM 요청 실패' }, { status: 500 });
  }
}
