import dotenv from 'dotenv';
import OpenAI from 'openai';

import { getClient } from '@/supabase/getClient';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 태그 정보를 담을 타입 정의
interface Tag {
  id: number;
  name: string;
  category: string;
}

/**
 * DB에서 전체 태그 목록을 읽어와 AI 프롬프트용 텍스트로 변환한다.
 */
export const getTagsForPrompt = async (): Promise<string> => {
  const supabase = getClient();
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, category')
    .order('id');

  if (error) {
    console.error('Error fetching tags:', error);
    return '';
  }

  // AI가 읽기 편하게 "ID: 이름 (카테고리)" 형식으로 변환
  return tags.map((tag: Tag) => `${tag.id}: ${tag.name} (${tag.category})`).join('\n');
};

export const autoTagSong = async (
  title: string,
  artist: string,
  tagsPrompt: string,
): Promise<number[]> => {
  try {
    if (!tagsPrompt) return [];

    // 1단계: 정규식을 이용한 문자열 사전 분석 (Harness)
    const hasHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(title + artist);
    const hasKana = /[ぁ-んァ-ヶ]/.test(title + artist);

    // LLM에게 줄 강력한 힌트 생성
    const languageHints = `
      - [Detected Script] Hangul Present: ${hasHangul}, Japanese Kana Present: ${hasKana}
    `.trim();

    // 2단계: OpenAI API 호출
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
            You are a music database expert specializing in global artist categorization.

            [Language Selection Strategy]
            - **Do NOT** assume a song is 102 (팝송) solely based on English/Latin characters.
            - If title/artist are in English, research the **artist's origin and primary market**.
            - Priority Logic:
              1. If Hangul is detected OR the artist is a K-Pop artist: Select 100 (한국노래).
              2. If Kana is detected OR the artist is a J-Pop/Japanese artist: Select 101 (일본노래).
              3. Select 102 (팝송) ONLY if the artist is primarily from Western/English-speaking regions.
              4. For all other cases or truly global/mixed origins, use 103 (글로벌).

            [Selection Rules]
            - Language Slot (100-199): EXACTLY 1 tag.
            - Genre Slot (200-299): EXACTLY 1 tag.
            - Origin Slot (300-399): 1 to 2 tags, sorted by relevance.

            [Contextual Hints]
            ${languageHints}

            Allowed Tags List:
            ${tagsPrompt}
          `,
        },
        {
          role: 'user',
          content: `Title: "${title}", Artist: "${artist}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const result: { tag_ids: number[] } = JSON.parse(content);
    return result.tag_ids;
  } catch (error) {
    console.error('Error auto-tagging song:', error);
    return [];
  }
};
