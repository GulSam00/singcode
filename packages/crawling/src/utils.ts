export const parseNumber = (str: string) => {
  if (str.length < 5 || !isNumber(str)) {
    return null;
  }
  return str;
};

// 정규식으로 숫자 확인
export const isNumber = (str: string) => {
  return /^\d+$/.test(str);
};

export const parseJapaneseText = (text: string) => {
  const koreanParts = text.match(/[가-힣\s,]+/g);
  const koreanText = koreanParts ? koreanParts.join("").trim() : "";
  let result = text
    // 일본어 독음 제거
    .replace(/\([^)]*\)/g, "");

  // 한글 제거
  result = result.replace(/[가-힣,]+/g, "").trim();

  // 특수 기호 제거
  result = result.replace(/[ⓢⓗⓕⓛ]/g, "");

  if (result.length === 0 && koreanText.length > 0) {
    return koreanText;
  }

  if (koreanText.length > 0) {
    result += `(${koreanText})`;
  }

  return result;
};

export const parseText = (text: string) => {
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[※★☆○●◎◇◆□■△▲▽▼→←↑↓↔]/g, "")
    .trim();
};

export const containsJapanese = (text: string): boolean => {
  const match = text.match(
    /^([가-힣\s]+)\s*\(([\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]+)\)$/
  );
  if (match) {
    return false;
  }
  console.log("match : ", text);

  // 2. 그 외에는 기존 일본어 판별 로직 사용
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/.test(text);
};
