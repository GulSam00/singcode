import OpenAI from 'openai';
import dotenv from 'dotenv';

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

let cachedTagsPrompt: string | null = null;

/**
 * DB에서 전체 태그 목록을 읽어와 AI 프롬프트용 텍스트로 변환한다.
 */
const getTagsForPrompt = async (): Promise<string> => {
  if (cachedTagsPrompt) return cachedTagsPrompt;

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
  cachedTagsPrompt = tags.map((tag: Tag) => `${tag.id}: ${tag.name} (${tag.category})`).join('\n');
  return cachedTagsPrompt;
};

/**
 * AI를 활용해 노래에 적절한 태그 ID들을 추출한다.
 */
export const autoTagSong = async (title: string, artist: string): Promise<number[]> => {
  try {
    // 1단계: 프롬프트용 태그 리스트 준비
    const tagsPrompt = await getTagsForPrompt();
    if (!tagsPrompt) return [];

    // 2단계: OpenAI API 호출
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // 가성비가 좋은 모델 사용
      messages: [
        {
          role: 'system',
          content: `
            You are a music database expert. Based on the song title and artist, categorize the song by selecting appropriate tag IDs from the provided list.

            Guidelines:
            1. Select at least one tag, but no more than 4.
            2. Prioritize Language (100s), then Genre (200s), then Origin (300s).
            3. If it's Japanese music, ALWAYS include 101 (J-POP).
            4. Be precise. If it's from an Anime, use 302 (애니메이션).
            5. Return only JSON: {"tag_ids": [number, number, ...]}

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
      temperature: 0, // 결과의 일관성을 위해 0으로 설정
      max_tokens: 50, // 결과가 짧으므로 토큰 제한
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    // 3단계: 결과 파싱 및 반환
    const result: { tag_ids: number[] } = JSON.parse(content);
    return result.tag_ids;
  } catch (error) {
    console.error('Error auto-tagging song:', error);
    return [];
  }
};
