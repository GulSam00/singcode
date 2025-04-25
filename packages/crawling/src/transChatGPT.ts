import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// getObject("AAA(혼성그룹)", "AAA", 0, 3, 2),
// getObject("Aimer", "에이머(Aimer)", 2, 0, 1),
// getObject("amazarashi", "아마자라시(amazarashi)", 0, 1, 2),
// getObject("BUMP OF CHICKEN", "BUMP OF CHICKEN", 0, 1, 2),
// getObject("DREAMS COME TRUE(밴드)", "DREAMS COME TRUE", 0, 1, 2),
// getObject("ELLEGARDEN", "엘르가든(ELLEGARDEN)", 0, 1, 2),
// getObject("King Gnu", "킹누(King Gnu)", 0, 1, 2),
// getObject("LiSA", "리사(LiSA)", 2, 0, 1),
// getObject("Mrs. GREEN APPLE", "미세스그린애플(Mrs. GREEN APPLE)", 0, 1, 2),
// getObject("Official髭男dism", "오피셜히게단디즘(Official髭男dism)", 2, 0, 1),
// getObject("Perfume", "퍼퓸(Perfume)", 0, 1, 2),
// getObject("RADWIMPS", "래드윔프스(RADWIMPS)", 2, 0, 1),
// getObject("SEKAI NO OWARI", "세카이노오와리(SEKAI NO OWARI)", 0, 1, 2),
// getObject("SPYAIR", "스파이에어(SPYAIR)", 2, 0, 1),
// getObject("Vaundy", "바운디(Vaundy)", 2, 0, 1),
// getObject("w-inds.", "w-inds.", 0, 1, 2),
// getObject("YOASOBI", "요아소비(YOASOBI)", 0, 1, 2),

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
      4. 만약 이미 번역된 형태라면 그대로 반환할 것
      5. 확실하지 않은 경우 "UNKNOWN"을 반환하세요`,
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

// const transData = await transChatGPT("緑黄色社会");
// console.log(transData);
