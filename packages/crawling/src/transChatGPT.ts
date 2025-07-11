import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TranslationAssistant {
  private messages: Array<OpenAI.Chat.ChatCompletionMessageParam>;

  constructor() {
    this.messages = [
      {
        role: 'system',
        content: `You are a Japanese music translator. Follow these rules:
            1. Translate song/artist names to Korean.
            2. Format: Translation
            3. Priority: Official KR release > Common Korean media name > Korean Fandom name
            4. If already translated, reformat only.
            5. If unsure, return null.
          `,
      },
    ];
  }

  async translate(text: string): Promise<string | null> {
    // 새로운 사용자 메시지 추가
    this.resetContext();
    this.messages.push({
      role: 'user',
      content: text,
    });

    // API 호출
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo', // gpt-4 대신 gpt-3.5-turbo
      messages: this.messages,
      temperature: 0.3,
    });

    // 어시스턴트의 응답 저장
    const assistantMessage = response.choices[0].message;

    if (!assistantMessage.content) {
      console.error('Assistant message is empty');
      return null;
    }

    const content = assistantMessage.content.trim();
    if (content.toLowerCase() === 'null') {
      return null;
    }
    return content ?? null;
  }

  // 컨텍스트 초기화가 필요한 경우
  resetContext() {
    this.messages = [this.messages[0]]; // 시스템 메시지만 유지
  }
}

// 싱글톤 인스턴스 생성
const translator = new TranslationAssistant();

export const transChatGPT = async (text: string) => {
  return await translator.translate(text);
};
