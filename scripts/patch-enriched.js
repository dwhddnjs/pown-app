// react-native-enriched 0.4.1 패치 — npm install 뒤(postinstall) 돈다. 버전을 올리면 이 스크립트를 확인할 것
// 1. iOS 굵게: 에디터는 굵게·제목을 글꼴의 Bold 특성으로 켜고 끄고 알아보는데(FontExtension.mm), SB 어그로는
//    세 굵기 모두 weightClass 400이라 CoreText가 어느 것도 굵다고 보지 않는다 — 굵게가 아무것도 안 바뀌었다.
//    sb-l ↔ sb-m(OTSBAggroL ↔ OTSBAggroM)을 이름으로 잇고 sb-m을 굵은 글꼴로 친다(켜짐 표시·끄기·저장 <b>).
//    읽기 화면(components/rich-note.tsx RICH_NOTE_BOLD)과 안드로이드(plugins/with-sb-font-family.js)도 sb-m이다.
// 2. 추천 단어 바: 이 판엔 autoCorrect·spellCheck prop이 없어 키보드 위에 추천 단어 바가 떴다 — 예전 본문
//    TextInput(autoCorrect·spellCheck false)과 같게 끈다 (iOS 자동 수정·맞춤법, 안드로이드 NO_SUGGESTIONS)
const fs = require("fs");
const path = require("path");

const MARK = "POWN_ENRICHED_PATCH";
const swap = (from, to) => `
  // ${MARK} ${from}
  if ([self.fontName isEqualToString:@"${from}"]) {
    UIFont *mapped = [UIFont fontWithName:@"${to}" size:self.pointSize];
    if (mapped != nil) {
      return mapped;
    }
  }`;

const FILES = [
  [
    "ios/extensions/FontExtension.mm",
    [
      [
        /(- \(BOOL\)isBold \{)/,
        `$1\n  // ${MARK} isBold\n  if ([self.fontName isEqualToString:@"OTSBAggroM"]) {\n    return YES;\n  }`,
      ],
      [
        /(- \(UIFont \*\)setBold \{\s*if \(\[self isBold\]\) \{\s*return self;\s*\})/,
        `$1${swap("OTSBAggroL", "OTSBAggroM")}`,
      ],
      [
        /(- \(UIFont \*\)removeBold \{\s*if \(!\[self isBold\]\) \{\s*return self;\s*\})/,
        `$1${swap("OTSBAggroM", "OTSBAggroL")}`,
      ],
    ],
  ],
  [
    "ios/EnrichedTextInputView.mm",
    [
      // 3. 한글 조합: iOS 한글 자판은 'ㅎ'을 넣은 뒤 'ㅏ'가 오면 그 글자를 '하'로 다시 조합하는데, 다시 조합된
      //    글자는 'ㅎ'이 아니라 그 앞 글자의 서식을 받는다. 그래서 굵게를 끈 뒤 친 글자가 다시 굵어지고, 제목에서
      //    줄을 바꾼 뒤 친 첫 글자가 윗줄 제목 크기를 받아 제목이 다음 줄로 이어졌다(영어는 조합이 없어 멀쩡했다).
      //    글자를 넣기 전 바로 앞 한글 글자·그 서식·지금 칠 서식을 기억해 두고, 넣은 뒤 앞 글자가 다시 조합됐으면
      //    앞 글자는 원래 서식, 거기서 갈라져 나온 새 글자는 칠 때 서식으로 돌려놓는다
      [
        /(  BOOL _emitHtml;\n)/,
        `$1  // ${MARK} ime-ivars
  NSUInteger _pownComposeLocation;
  NSString *_pownComposeChar;
  NSDictionary *_pownComposeAttrs;
  NSDictionary *_pownComposeTyping;
`,
      ],
      [
        /(    \[linkStyle manageLinkTypingAttributes\];\n  \}\n\n)(  return YES;\n\}\n\n- \(void\)textViewDidChangeSelection)/,
        `$1  // ${MARK} ime-remember
  _pownComposeChar = nil;
  if (range.length == 0 && range.location > 0 && text.length > 0 &&
      [text rangeOfCharacterFromSet:NSCharacterSet.newlineCharacterSet].location == NSNotFound) {
    unichar previous = [textView.textStorage.string characterAtIndex:range.location - 1];
    if ((previous >= 0x1100 && previous <= 0x11FF) || (previous >= 0x3130 && previous <= 0x318F) ||
        (previous >= 0xAC00 && previous <= 0xD7A3)) {
      _pownComposeLocation = range.location - 1;
      _pownComposeChar = [NSString stringWithCharacters:&previous length:1];
      _pownComposeAttrs = [textView.textStorage attributesAtIndex:range.location - 1 effectiveRange:nil];
      _pownComposeTyping = [textView.typingAttributes copy];
    }
  }

$2`,
      ],
      [
        /(- \(void\)textViewDidChange:\(UITextView \*\)textView \{\n)/,
        `$1  // ${MARK} ime-restore
  if (_pownComposeChar != nil) {
    NSUInteger location = _pownComposeLocation;
    NSUInteger cursor = textView.selectedRange.location;
    if (location < textView.textStorage.length && cursor > location &&
        ![[textView.textStorage.string substringWithRange:NSMakeRange(location, 1)]
            isEqualToString:_pownComposeChar]) {
      // 다시 조합된 앞 글자는 원래 서식, 거기서 갈라져 나온 새 글자('핳'+'ㅏ' → '하하'의 뒤)는 친 때의 서식
      [textView.textStorage setAttributes:_pownComposeAttrs range:NSMakeRange(location, 1)];
      if (cursor > location + 1) {
        [textView.textStorage setAttributes:_pownComposeTyping
                                      range:NSMakeRange(location + 1, cursor - location - 1)];
      }
      textView.typingAttributes = _pownComposeTyping;
    }
    _pownComposeChar = nil;
  }
`,
      ],
      // 5. 줄 높이: 이 판엔 lineHeight 스타일이 없어 sb 글꼴 자연 줄 높이(글자 1.2배)로 빽빽했다 — 줄마다 자연 줄 높이의
      //    0.25배를 아래에 더해 1.5배로 맞춘다(제목처럼 큰 글자도 비율대로). 레이아웃 매니저 줄 간격이라 커서 높이는
      //    그대로다. 읽기 화면(components/rich-note.tsx LINE_SPACING)과 안드로이드도 같은 배율이다
      [
        /(  textView\.layoutManager\.input = self;\n)/,
        `$1  // ${MARK} line-height
  textView.layoutManager.delegate = (id<NSLayoutManagerDelegate>)self;
`,
      ],
      [
        /(- \(void\)setupPlaceholderLabel \{)/,
        `// ${MARK} line-height-spacing
- (CGFloat)layoutManager:(NSLayoutManager *)layoutManager
    lineSpacingAfterGlyphAtIndex:(NSUInteger)glyphIndex
    withProposedLineFragmentRect:(CGRect)rect {
  return rect.size.height * 0.25;
}

$1`,
      ],
      [
        /(textView\.textContainer\.lineFragmentPadding = 0;)/,
        `$1\n  // ${MARK} suggestions\n  textView.autocorrectionType = UITextAutocorrectionTypeNo;\n  textView.spellCheckingType = UITextSpellCheckingTypeNo;`,
      ],
    ],
  ],
  [
    // 5-1. 줄 간격을 더하면 줄 영역이 아래로 늘어나, 그 가운데에 그리던 글머리 점·체크박스가 줄 간격 절반만큼
    //      글자보다 내려앉았다 — 줄 간격을 뺀 글자 줄의 가운데(줄 영역 높이 1.25 중 0.5 → 0.4)에 그린다
    "ios/extensions/LayoutManagerExtension.mm",
    [
      [
        /CGFloat centerY = CGRectGetMidY\(usedRect\) \+ origin\.y;/g,
        `CGFloat centerY = usedRect.origin.y + usedRect.size.height * 0.4 + origin.y; // ${MARK} line-height-marker`,
      ],
    ],
  ],
  [
    // 5-2. 안드로이드는 줄 가운데((top+bottom)/2)에 그리던 글머리 점·체크박스가 줄 간격 때문에 글자와 어긋난다 —
    //      iOS가 그리는 자리(자연 줄의 가운데 = 기준선에서 0.2em 위)에 그린다. 줄 간격과 상관없이 맞는다
    "android/src/main/java/com/swmansion/enriched/common/spans/EnrichedUnorderedListSpan.kt",
    [
      [
        /val yPosition = \(top \+ bottom\) \/ 2f/,
        `val yPosition = baseline - paint.textSize * 0.2f // ${MARK} line-height-marker`,
      ],
    ],
  ],
  [
    "android/src/main/java/com/swmansion/enriched/common/spans/EnrichedCheckboxListSpan.kt",
    [
      [
        /val lineCenter = \(top \+ bottom\) \/ 2f/,
        `val lineCenter = baseline - paint.textSize * 0.2f // ${MARK} line-height-marker`,
      ],
    ],
  ],
  [
    // 4. 키보드 위 툴바: RN <InputAccessoryView nativeID="enriched-text-input">는 창에서 inputAccessoryViewID가
    //    같은 입력을 찾아 키보드 보조 막대로 붙인다 — 에디터 텍스트뷰가 그 이름으로 응답하게 한다
    //    (components/note-toolbar-dock.ios.tsx). 키보드와 한 몸이라 JS로 따라 움직일 때처럼 늦거나 뜨지 않는다
    "ios/inputTextView/InputTextView.mm",
    [
      [
        /(@implementation InputTextView\n)/,
        `$1\n// ${MARK} accessory\n- (NSString *)inputAccessoryViewID {\n  return @"enriched-text-input";\n}\n`,
      ],
    ],
  ],
  [
    "android/src/main/java/com/swmansion/enriched/textinput/EnrichedTextInputView.kt",
    [
      // 6. 안드로이드 제목 번짐: 화면에 붙을 때(onAttachedToWindow) 부르는 setTextIsSelectable이 글 전체를 다시
      //    setText하는데, 값 넣기 보호(transaction) 밖이라 입력 중 서식 처리가 돌아 커서 자리의 제목을 글 끝까지
      //    늘렸다 — 제목 다음 본문·목록이 제목이 되고, 그대로 저장하면 본문이 <h1>로 바뀌었다. 같은 보호로 감싼다
      [
        /(\n)(    super\.setTextIsSelectable\(true\)\n)/,
        `$1    // ${MARK} attach-transaction
    val wasInTransaction = isDuringTransaction
    isDuringTransaction = true
    try {
  $2    } finally {
      isDuringTransaction = wasInTransaction
    }
`,
      ],
      // 줄 높이 1.5em: SB 어그로는 안드로이드 글꼴 지표(ascent~descent)가 1.56em이라 iOS(1.2em)처럼 고정 배율을
      // 곱하면 넘친다 — 글자 크기·글꼴이 정해질 때마다 1.5em ÷ 실제 지표로 배율을 잡는다(제목도 같은 배율로 비례)
      [
        /(  private fun updateTypeface\(\) \{)/,
        `  // ${MARK} line-height-apply
  private fun applyPownLineSpacing() {
    // 줄 높이는 정수 픽셀 지표(ascent·descent 각각 올림)에 배율을 곱한다 — 실수 지표로 잡으면 줄마다 0.38씩 길었다
    val metrics = paint.fontMetricsInt
    val natural = (metrics.descent - metrics.ascent).toFloat()
    if (natural > 0f) setLineSpacing(0f, 1.5f * textSize / natural)
  }

$1`,
      ],
      [
        /(    paint\.typeface = newTypeface\n)/,
        `$1    applyPownLineSpacing() // ${MARK} line-height-typeface
`,
      ],
      [
        /(    setTextSize\(TypedValue\.COMPLEX_UNIT_PX, sizeInt\)\n)/,
        `$1    applyPownLineSpacing() // ${MARK} line-height-size
`,
      ],
      [
        /(    isSingleLine = false\n)/,
        `$1    // ${MARK} line-height — 줄 높이를 SB 글꼴 자체 지표(0.8em + 0.4em)로 잡는다. 안드로이드 15+ EditText는 한국어
    // 로케일 선호 글꼴(Noto CJK, ascent 1.17em)을 줄 높이 최솟값으로 써서 iOS보다 줄이 1.3배 높고 첫 줄이 5.9 내려갔다
    // 목록·제목 문단 앞에 넣는 보이지 않는 글자(U+200B)는 SB에 없어 대체 글꼴(Roboto, ascent 0.93em) 지표가 그 줄에 섞였다
    includeFontPadding = false
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) isFallbackLineSpacing = false
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) isLocalePreferredLineHeightForMinimumUsed = false
`,
      ],
      [
        /(inputType = InputType\.TYPE_CLASS_TEXT or InputType\.TYPE_TEXT_FLAG_MULTI_LINE)(\n)/,
        `$1 or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS // ${MARK} suggestions$2`,
      ],
    ],
  ],
];

for (const [relative, patches] of FILES) {
  const file = path.join(
    __dirname,
    "../node_modules/react-native-enriched",
    relative,
  );
  if (!fs.existsSync(file)) continue;
  let source = fs.readFileSync(file, "utf8");
  // 패치마다 표식 줄이 이미 있으면 그 패치만 건너뛴다
  const applied = patches.filter(
    ([from, to]) =>
      from.test(source) && !source.includes(to.match(/\/\/ .*/)[0]),
  );
  for (const [from, to] of applied) source = source.replace(from, to);
  fs.writeFileSync(file, source);
  console.log(
    `react-native-enriched ${path.basename(relative)}: 패치 ${applied.length}/${patches.length}` +
      (applied.length ? "" : " (이미 패치했거나 버전이 바뀜)"),
  );
}
