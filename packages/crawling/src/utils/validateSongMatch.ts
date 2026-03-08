import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI를 활용해 두 (제목, 아티스트) 쌍이 같은 곡인지 판단한다.
 * 표기 차이(띄어쓰기, 영문/한글 혼용, 특수문자 등)는 같은 곡으로 허용한다.
 */
export const validateSongMatch = async (
  inputTitle: string,
  inputArtist: string,
  foundTitle: string,
  foundArtist: string,
): Promise<boolean> => {
  // 완전 일치 시 API 호출 없이 즉시 반환
  if (inputTitle === foundTitle && inputArtist === foundArtist) return true;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Decide if two (title, artist) pairs refer to the same song. Allow spelling variants (spaces, en/kr, case). Return JSON: {"isValid":boolean}',
      },
      {
        role: 'user',
        content: `"${inputTitle}"(${inputArtist}) vs "${foundTitle}"(${foundArtist})`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
    max_tokens: 20,
  });

  const content = response.choices[0].message.content;
  if (!content) return false;

  const result: { isValid: boolean } = JSON.parse(content);
  return result.isValid;
};
