import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationResult {
  title_ko: string;
  artist_ko: string;
}

export async function translateJpnToKo(
  title: string,
  artist: string,
): Promise<TranslationResult | null> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Japanese music translator specializing in song/artist name translation to Korean.

Rules:
1. Provide the most common Korean name used in Korean music streaming services (Melon, YouTube Music).
2. Artist Name: Use the standard Korean phonetic transcription (e.g., "Official髭男dism" -> "오피셜히게단디즘", "米津玄師" -> "요네즈 켄시"). Do NOT translate the meaning of artist names.
3. Song Title: 
   - If there is a widely used Korean translation, use it (e.g., "夜에 駆ける" -> "밤을 달리다").
   - If not, provide the phonetic transcription (e.g., "アイドル" -> "아이돌").
4. If the input is already in Korean or English and no distinct Korean name exists, return it as-is.
5. Return ONLY JSON: {"title_ko": "...", "artist_ko": "..."}`,
        },
        {
          role: 'user',
          content: `title: "${title}", artist: "${artist}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const result: TranslationResult = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('translateJpnToKo error:', error);
    return null;
  }
}
