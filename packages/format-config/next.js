export default {
  printWidth: 100, // 한 줄 최대 길이
  tabWidth: 2, // 탭 크기 (스페이스 2칸)
  singleQuote: true, // 작은따옴표 사용
  trailingComma: "all", // 여러 줄일 때 항상 쉼표 사용
  arrowParens: "avoid", // 화살표 함수 괄호 생략 (ex: x => x)
  bracketSpacing: true, // 중괄호 간격 유지 (ex: { foo: bar })
  jsxSingleQuote: false, // JSX에서 작은따옴표 사용 안 함
  endOfLine: "auto",
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@repo/(.*)$",
    "^@/(.*)$",
    "^../(.*)$",
    "^./(.*)$",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
};
