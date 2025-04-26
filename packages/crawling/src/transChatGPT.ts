import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TranslationAssistant {
  private messages: Array<OpenAI.Chat.ChatCompletionMessageParam>;

  constructor() {
    this.messages = [
      {
        role: "system",
        content: `당신은 일본 음악 전문가입니다. 다음 규칙을 철저히 따르세요.
      1. 주어진 일본어 아티스트/곡 이름의 한국어 공식 번역을 제공하세요
      2. 응답은 다음 형식을 반드시 따를 것:
      번역된 결과 (원문)
      3. 다음 우선순위로 번역을 결정하세요:
        - 공식 한국 발매 시 사용된 이름
        - 한국 음악 사이트/미디어에서 통용되는 이름
        - 팬덤에서 일반적으로 사용하는 이름
      4. 만약 이미 번역된 형태라면 그대로 반환하되, 형식이 다르거나 어색하다면 형식에 맞게 반환할 것
      5. 확실하지 않은 경우 빈 문자열을 반환`,
      },
    ];
  }

  async translate(text: string): Promise<string | null> {
    // 새로운 사용자 메시지 추가
    this.resetContext();
    this.messages.push({
      role: "user",
      content: text,
    });

    // API 호출
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // gpt-4 대신 gpt-3.5-turbo
      messages: this.messages,
      temperature: 0.3,
    });

    // 어시스턴트의 응답 저장
    const assistantMessage = response.choices[0].message;

    return assistantMessage.content ?? null;
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
