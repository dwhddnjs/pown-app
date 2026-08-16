// 한글 초성 검색 — 운동 태그 검색 시트에서 "ㅂ"만 쳐도 "벤치프레스"가 나오게 한다.

const INITIAL_CONSONANTS = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
]

// 완성형 한글 음절(가~힣)의 코드포인트에서 초성을 뽑는다.
// 한글이 아니면 첫 글자를 그대로 돌려준다.
export const getInitialConsonant = (str: string) => {
  if (!str) return ""
  const firstChar = str.charCodeAt(0)
  if (firstChar < 0xac00 || firstChar > 0xd7a3) return str[0]
  return INITIAL_CONSONANTS[Math.floor((firstChar - 0xac00) / 28 / 21)]
}

export const searchByInitial = (name: string, search: string) =>
  getInitialConsonant(name) === search
