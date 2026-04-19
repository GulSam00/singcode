import dotenv from 'dotenv';
import OpenAI from 'openai';

import { getClient } from '@/supabase/getClient';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 태그 카테고리별 범위
const LANGUAGE_TAG_MIN = 100;
const LANGUAGE_TAG_MAX = 200;
const GENRE_TAG_MIN = 200;
const GENRE_TAG_MAX = 300;
const ORIGIN_TAG_MIN = 300;
const ORIGIN_TAG_MAX = 400;

// 확정 분류용 언어 태그 ID
const TAG_KOREAN = 100;
const TAG_JAPANESE = 101;

// 태그 정보를 담을 타입 정의
interface Tag {
  id: number;
  name: string;
  category: string;
}

interface LLMTagResult {
  language: number;
  genre: number;
  origin: number[];
}

/**
 * DB에서 태그 목록(100~399)을 읽어와 AI 프롬프트용 텍스트로 변환한다.
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

  return tags.map((tag: Tag) => `${tag.id}: ${tag.name} (${tag.category})`).join('\n');
};

const isValidTagId = (id: number, min: number, max: number) => id >= min && id < max;

/**
 * 같은 아티스트의 기존 태그를 전체(language/genre/origin) 조회한다.
 */
const getExistingArtistTags = async (artist: string) => {
  const supabase = getClient();
  const { data } = await supabase
    .from('songs')
    .select('song_tags!inner(tag_id)')
    .eq('artist', artist)
    .gte('song_tags.tag_id', LANGUAGE_TAG_MIN)
    .lt('song_tags.tag_id', ORIGIN_TAG_MAX)
    .limit(1);

  if (!data || data.length === 0) return null;

  const tagIds = (data as { song_tags: { tag_id: number }[] }[])[0].song_tags.map(t => t.tag_id);

  const language = tagIds.find(id => isValidTagId(id, LANGUAGE_TAG_MIN, LANGUAGE_TAG_MAX));
  const genre = tagIds.find(id => isValidTagId(id, GENRE_TAG_MIN, GENRE_TAG_MAX));
  const origin = tagIds.filter(id => isValidTagId(id, ORIGIN_TAG_MIN, ORIGIN_TAG_MAX));

  // 세 카테고리 모두 있어야 재사용
  if (language && genre && origin.length > 0) {
    return [language, genre, ...origin];
  }
  return null;
};

/**
 * LLM으로 language/genre/origin 태그를 한 번에 판별한다.
 */
const getTagsFromLLM = async (
  title: string,
  artist: string,
  tagsPrompt: string,
  knownLanguageTag?: number,
): Promise<number[] | null> => {
  const languageInstruction = knownLanguageTag
    ? `Language tag is already determined as ${knownLanguageTag}. Return it as-is.`
    : `Select EXACTLY 1 language tag (100~199).`;

  const response = await client.chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      {
        role: 'system',
        content: `
You are a music database expert. Tag the given song with:
1. Language (100~199): EXACTLY 1 tag. ${languageInstruction}
2. Genre (200~299): EXACTLY 1 tag.
3. Origin (300~399): 1 to 3 tags.

[Language Rules]
- K-Pop/Korean artist → 100 (한국노래)
- J-Pop/Japanese artist → 101 (일본노래)
- Western/English-speaking → 102 (팝송)
- Otherwise → 103 (글로벌)

[Output]
Return JSON: {"language": <number>, "genre": <number>, "origin": [<number>, ...]}
Example: {"language": 100, "genre": 201, "origin": [300, 302]}

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

  const result: LLMTagResult = JSON.parse(content);

  const languageTag = knownLanguageTag ?? result.language;
  if (!isValidTagId(languageTag, LANGUAGE_TAG_MIN, LANGUAGE_TAG_MAX)) return null;
  if (!isValidTagId(result.genre, GENRE_TAG_MIN, GENRE_TAG_MAX)) return null;

  const validOrigin = result.origin.filter(id => isValidTagId(id, ORIGIN_TAG_MIN, ORIGIN_TAG_MAX));
  if (validOrigin.length === 0) return null;

  return [languageTag, result.genre, ...validOrigin.slice(0, 3)];
};

export const autoTagSong = async (
  title: string,
  artist: string,
  tagsPrompt: string,
): Promise<number[] | null> => {
  try {
    if (!tagsPrompt) return null;

    // 1단계: 같은 아티스트의 기존 태그가 모두 있으면 재사용 (API 호출 생략)
    const existingTags = await getExistingArtistTags(artist);
    if (existingTags) return existingTags;

    // 2단계: 한글/가나 감지로 언어 태그만 사전 결정
    const titleAndArtist = title + artist;
    const hasHangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(titleAndArtist);
    const hasKana = /[ぁ-んァ-ヶ]/.test(titleAndArtist);
    const knownLanguageTag = hasHangul ? TAG_KOREAN : hasKana ? TAG_JAPANESE : undefined;

    // 3단계: LLM으로 genre + origin (+ 필요 시 language) 판별
    return await getTagsFromLLM(title, artist, tagsPrompt, knownLanguageTag);
  } catch (error) {
    console.error('Error auto-tagging song:', error);
    return null;
  }
};
