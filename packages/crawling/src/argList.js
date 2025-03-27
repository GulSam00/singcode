const getObject = (url, artist, titleIndex, tjIndex, kyIndex) => {
  return { url, artist, titleIndex, tjIndex, kyIndex };
};

// 테이블 구조 상 불가능했던 문서
// aiko, AKB48,
// 너무 적은 데이터
// &TEAM

export const argList = [
  // url, artist, titleIndex, tjIndex, kyIndex
  //   getObject('AAA(혼성그룹)', 'AAA', 0, 3, 2),
  //   getObject('Aimer', 'Aimer', 2, 0, 1),
  //   getObject('아이묭', '아이묭 (あいみょん)', 0, 1, 2),
  getObject('amazarashi', 'amazarashi', 0, 1, 2),
  getObject('BUMP OF CHICKEN', 'BUMP OF CHICKEN', 0, 1, 2),
];
