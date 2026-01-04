interface RecommendationType {
  title: string;
  artist: string;
  reason: string;
}

export interface ChatResponseType {
  intro: string;
  recommendations: RecommendationType[];
}

export function safeParseJson(text: string): ChatResponseType | null {
  try {
    // 1. JSON 영역만 추출
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1) return null;

    const jsonText = text.slice(start, end + 1);

    const parsed = JSON.parse(jsonText);

    // 2. 최소 구조 검증
    if (typeof parsed.intro !== 'string' || !Array.isArray(parsed.recommendations)) {
      return null;
    }

    // 3. recommendation 아이템 검증
    const validItems = parsed.recommendations.filter(
      (item: RecommendationType) =>
        typeof item.title === 'string' &&
        typeof item.artist === 'string' &&
        typeof item.reason === 'string',
    );

    return {
      intro: parsed.intro,
      recommendations: validItems,
    };
  } catch {
    return null;
  }
}
