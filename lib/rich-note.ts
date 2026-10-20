// 전체 노트 본문은 react-native-enriched가 내는 HTML(<html>…</html>)로 content에 저장한다.
// 퀵 노트·예전 노트는 평문 그대로다 — 판별은 라이브러리와 같은 규칙(평문이면 에디터도 평문으로 읽는다)
export const isRichNote = (content: string) =>
  content.startsWith("<html>") && content.endsWith("</html>");

export type RichNoteRun = {
  text: string;
  bold: boolean;
  underline: boolean;
  strike: boolean;
};

export type RichNoteBlock = {
  kind: "p" | "h1" | "h2" | "ul" | "ol" | "check";
  runs: RichNoteRun[];
  quote: boolean;
  // ol 번호 (1부터)
  index: number;
  checked: boolean;
};

// &amp; &lt; &gt;는 그대로 둔다 — 두 플랫폼 에디터가 다 읽는 이스케이프다
const decodeExtraEntities = (html: string) =>
  html
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, "\u00A0")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

const decodeEntities = (text: string) =>
  decodeExtraEntities(text)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// 노트를 이루는 글자만 — 검색과 "비었는지" 판정에 쓴다
export const richNotePlain = (content: string) =>
  isRichNote(content)
    ? decodeEntities(
        content
          .replace(/<br>|<\/(p|h\d|li)>/g, "\n")
          .replace(/<[^>]*>/g, "")
          .replace(/\u200B/g, ""),
      ).trim()
    : content;

// 에디터가 낸 HTML을 저장 형태로. 안드로이드는 한글·이모지를 전부 &#54620; 같은 숫자 엔티티로 내는데
// iOS 에디터는 &amp; &lt; &gt;만 풀어서, 안드로이드 백업을 iOS에서 열면 엔티티가 글자로 보였다 — 풀어 둔다.
// 글자가 하나도 없으면 ""로 — 계획 폼이 퀵 노트 입력칸으로 돌아간다
export const normalizeRichNote = (html: string) =>
  richNotePlain(html) ? decodeExtraEntities(html) : "";

const TOKEN = /<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi;

// enriched가 내는 태그만 해석한다. 툴바에 없는 서식(i·code·a·h3~h6·codeblock)은 글자만 남긴다
export const parseRichNote = (html: string): RichNoteBlock[] => {
  const blocks: RichNoteBlock[] = [];
  let list: "ul" | "ol" | "check" | null = null;
  let olIndex = 0;
  let quote = false;
  let block: RichNoteBlock | null = null;
  const inline = { b: 0, u: 0, s: 0 };

  const open = (kind: RichNoteBlock["kind"], checked = false) => {
    const next: RichNoteBlock = {
      kind,
      runs: [],
      quote,
      index: kind === "ol" ? ++olIndex : 0,
      checked,
    };
    blocks.push(next);
    return next;
  };

  for (const [, closing, rawTag, attrs, text] of html.matchAll(TOKEN)) {
    if (text !== undefined) {
      // 블록 사이 줄바꿈은 서식용이다. 문단 안에는 줄바꿈이 없다(줄마다 블록)
      const value = decodeEntities(text.replace(/[\n\u200B]/g, ""));
      if (!value) continue;
      block ??= open("p");
      block.runs.push({
        text: value,
        bold: inline.b > 0,
        underline: inline.u > 0,
        strike: inline.s > 0,
      });
      continue;
    }
    const tag = rawTag.toLowerCase();
    if (tag === "b" || tag === "u" || tag === "s") {
      inline[tag] += closing ? -1 : 1;
      continue;
    }
    if (closing) {
      if (tag === "ul" || tag === "ol") list = null;
      else if (tag === "blockquote") quote = false;
      else if (/^(p|h\d|li|codeblock)$/.test(tag)) block = null;
      continue;
    }
    if (tag === "br") {
      open("p");
      block = null;
    } else if (tag === "ul") {
      list = attrs.includes("checkbox") ? "check" : "ul";
    } else if (tag === "ol") {
      list = "ol";
      olIndex = 0;
    } else if (tag === "li") {
      block = open(list ?? "ul", /\bchecked\b/.test(attrs));
    } else if (tag === "blockquote") {
      quote = true;
    } else if (tag === "h1" || tag === "h2") {
      block = open(tag);
    } else if (/^(p|h\d|codeblock)$/.test(tag)) {
      block = open("p");
    }
  }
  return blocks;
};
