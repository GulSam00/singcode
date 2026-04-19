import dotenv from 'dotenv';
import OpenAI from 'openai';

import { getClient } from '@/supabase/getClient';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 언어 태그 ID 범위 (100~199)
const LANGUAGE_TAG_MIN = 100;
const LANGUAGE_TAG_MAX = 200;

// 확정 분류용 언어 태그 ID
const TAG_KOREAN = 100;
const TAG_JAPANESE = 101;

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
    .gte('id', LANGUAGE_TAG_MIN)
    .lt('id', LANGUAGE_TAG_MAX)
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
): Promise<number | null> => {
  try {
    if (!tagsPrompt) return null;

    const titleAndArtist = title + artist;
    const hasHangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(titleAndArtist);
    const hasKana = /[ぁ-んァ-ヶ]/.test(titleAndArtist);

    // 1단계: 확실한 케이스는 API 호출 없이 바로 분류
    if (hasHangul) return TAG_KOREAN;
    if (hasKana) return TAG_JAPANESE;

    // 2단계: 같은 아티스트의 기존 태그가 있으면 재사용
    const supabase = getClient();
    const { data: existingTags } = await supabase
      .from('songs')
      .select('song_tags!inner(tag_id)')
      .eq('artist', artist)
      .gte('song_tags.tag_id', LANGUAGE_TAG_MIN)
      .lt('song_tags.tag_id', LANGUAGE_TAG_MAX)
      .limit(1);

    const existingTagId = (existingTags as { song_tags: { tag_id: number }[] }[] | null)?.[0]
      ?.song_tags?.[0]?.tag_id;
    if (existingTagId) return existingTagId;

    // 3단계: 영문 전용 곡만 LLM으로 판별
    const response = await client.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: `
            You are a music database expert. Select EXACTLY 1 language tag for the given song.
            The title and artist are in English/Latin script only.

            [Rules]
            - If the artist is a K-Pop/Korean artist: Select 100 (한국노래).
            - If the artist is a J-Pop/Japanese artist: Select 101 (일본노래).
            - If the artist is from Western/English-speaking regions: Select 102 (팝송).
            - Otherwise: Select 103 (글로벌).

            [Output]
            Return JSON: {"tag_id": <number>}
            Example: {"tag_id": 102}

            Allowed Tags:
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
    if (!content) return null;

    const result: { tag_id: number } = JSON.parse(content);
    return result.tag_id >= LANGUAGE_TAG_MIN && result.tag_id < LANGUAGE_TAG_MAX
      ? result.tag_id
      : null;
  } catch (error) {
    console.error('Error auto-tagging song:', error);
    return null;
  }
};
