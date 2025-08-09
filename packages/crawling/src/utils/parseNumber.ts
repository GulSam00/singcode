export const parseNumber = (str: string) => {
  if (!isNumber(str)) {
    return null;
  }
  return str;
};

// 정규식으로 숫자 확인
const isNumber = (str: string) => {
  return /^\d+$/.test(str);
};
