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
// 9번 스크롤 높이 — 새로 깐 node_modules(원래 줄)와 10/22 판이 걸린 node_modules(이행) 둘 다 이 코드로 바꾼다
const CONTENT_SIZE = `    // ${MARK} scroll-padding-size — 실제 레이아웃 높이(줄 간격 패치 5 포함)에 안쪽 여백을 더한다. boundingRect(measuredSize)는
    // 줄 간격을 몰라 글을 1.25배 짧게 재서, 긴 글의 끝이 스크롤로 안 올라오고 툴바·키보드 뒤에 갇혔다(40줄 중 7줄)
    CGFloat pownTextHeight = MAX(
        measuredSize.height,
        [self->textView.layoutManager usedRectForTextContainer:self->textView.textContainer].size.height);
    self->textView.contentSize = CGSizeMake(
        measuredSize.width, pownTextHeight + self->textView.textContainerInset.top +
                                self->textView.textContainerInset.bottom);
`;
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
      // 9. 위아래 여백 스크롤: RN은 패딩만큼 텍스트뷰 프레임을 안쪽으로 줄여서, 스크롤한 글이 에디터 위끝(디바이더)·
      //    아래끝(서식 툴바)이 아니라 패딩 선에서 잘려 사라졌다 — 툴바 위에 투명한 띠가 글을 가리는 것처럼 보였다.
      //    위아래 패딩은 프레임 대신 글 영역 안쪽 여백(textContainerInset)으로 옮긴다 — 처음·끝에선 그만큼 띄워 그리고,
      //    스크롤 중엔 글이 에디터 끝까지 지나간다. 안드로이드는 같은 번호의 onDraw 패치
      [
        /(  BOOL _emitHtml;\n)/,
        `$1  NSLayoutConstraint *_pownPlaceholderTop; // ${MARK} scroll-padding-ivar
`,
      ],
      [
        /\[_placeholderLabel\.topAnchor constraintEqualToAnchor:textView\.topAnchor\],/,
        `(_pownPlaceholderTop = [_placeholderLabel.topAnchor constraintEqualToAnchor:textView.topAnchor]), // ${MARK} scroll-padding-placeholder`,
      ],
      [/    self->textView\.contentSize = measuredSize;\n/, CONTENT_SIZE],
      // 10/22 판(boundingRect 높이에 여백만 더하던 것)이 이미 걸린 node_modules를 위 코드로 바꾼다 — 새로 깐 node_modules에선
      // 맞는 줄이 없어 아무것도 안 한다
      [
        /    \/\/ POWN_ENRICHED_PATCH scroll-padding-size — 글 높이만 재므로[^\n]*\n    self->textView\.contentSize = CGSizeMake\(\n        measuredSize\.width, measuredSize\.height \+ self->textView\.textContainerInset\.top \+\n                                self->textView\.textContainerInset\.bottom\);\n/,
        CONTENT_SIZE,
      ],
      [
        /(- \(void\)setupPlaceholderLabel \{)/,
        `// ${MARK} scroll-padding
- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics {
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  CGFloat top = layoutMetrics.contentInsets.top;
  CGFloat bottom = layoutMetrics.contentInsets.bottom;
  CGRect frame = RCTCGRectFromRect(layoutMetrics.getContentFrame());
  frame.origin.y -= top;
  frame.size.height += top + bottom;
  textView.frame = frame;
  textView.textContainerInset = UIEdgeInsetsMake(top, 0, bottom, 0);
  _pownPlaceholderTop.constant = top;
}

$1`,
      ],
      // 10. 문서 끝 입력 시 커서 따라가기: contentSize를 이 블록에서 비동기로 넣어서, UIKit이 커서로 스크롤할 땐 새 줄이
      //     아직 크기에 없다 — 끝에 줄을 계속 더하면 커서 줄이 키보드 뒤로 내려가고 화면이 안 따라왔다(문서 중간은 멀쩡).
      //     크기를 넣은 뒤 포커스 중이면 커서 줄과 아래 안쪽 여백(9번)이 보이게 한다. 선택만 바뀔 땐 이 블록이 안 돈다
      [
        /(  \}\);\n\}\n\n- \(void\)didMoveToWindow \{)/,
        `    // ${MARK} caret-follow
    if (self->textView.isFirstResponder && self->textView.selectedTextRange != nil) {
      CGRect caret = [self->textView caretRectForPosition:self->textView.selectedTextRange.end];
      caret.size.height += self->textView.textContainerInset.bottom;
      [self->textView scrollRectToVisible:caret animated:NO];
    }
$1`,
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
    // 4-1. 툴바 위 빈 칸: RN 보조 막대 내용 뷰는 툴바를 안전영역 아래끝에 붙이는데, 보조 막대 높이를 처음 잰 안전영역(화면
    //      아래 — 홈 인디케이터 34)으로 잡은 채 키보드 위에 붙어 툴바 위에 34짜리 칸이 남았다(투명하면 빈 박스, iOS 27에선
    //      글을 가렸다). 안전영역이 바뀌면 크기를 다시 재게 한다 — 화면 키보드 위에선 툴바 높이 그대로, 하드웨어 키보드(화면
    //      아래)에선 홈 인디케이터 위에 선다. react-native 파일이라 경로가 enriched 밖이다
    "../react-native/React/Fabric/Mounting/ComponentViews/InputAccessory/RCTInputAccessoryContentView.mm",
    [
      [
        /(- \(CGSize\)intrinsicContentSize\n\{\n)  \/\/ This is needed so the view size is based on autolayout constraints\.\n  return CGSizeZero;\n\}/,
        `$1  // ${MARK} accessory-safe-area
  return CGSizeMake(
      UIViewNoIntrinsicMetric,
      _heightConstraint.constant + self.safeAreaInsets.top + self.safeAreaInsets.bottom);
}

- (void)safeAreaInsetsDidChange
{
  [super safeAreaInsetsDidChange];
  [self invalidateIntrinsicContentSize];
}`,
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
      // 줄 높이 1.5em: 글자 크기·글꼴이 정해질 때마다 1.5em − 실제 정수 지표를 줄마다 더한다. 배율로 곱하면 본문 줄은
      // 같지만 제목 줄은 (자기 지표 × 배율)을 반올림해 원하는 픽셀이 안 나오는 높이가 생겼다(18 제목 70 다음이 72) —
      // 더하는 값이 정해져 있어야 제목 줄 높이(아래 8번)를 아무 픽셀로나 맞출 수 있다
      [
        /(  private fun updateTypeface\(\) \{)/,
        `  // ${MARK} line-height-apply
  private fun applyPownLineSpacing() {
    // 줄 높이는 정수 픽셀 지표(ascent·descent 각각 반올림)에서 잰다 — 실수 지표로 잡으면 줄마다 0.38씩 길었다
    // (EnrichedInputH1Span pownHeadingLine이 같은 값을 다시 잡는다)
    val metrics = paint.fontMetricsInt
    val natural = (metrics.descent - metrics.ascent).toFloat()
    if (natural > 0f) setLineSpacing(1.5f * textSize - natural, 1f)
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
      // 10/21 판(배율로 곱하던 줄 간격)이 이미 걸린 node_modules를 더하는 방식으로 바꾼다 — 위 line-height-apply는 표식이
      // 있으면 건너뛰어서, 그대로 두면 제목 줄 높이(8번)가 어긋난다. 새로 깐 node_modules에선 맞는 줄이 없어 아무것도 안 한다
      [
        /    if \(natural > 0f\) setLineSpacing\(0f, 1\.5f \* textSize \/ natural\)\n/,
        `    if (natural > 0f) setLineSpacing(1.5f * textSize - natural, 1f) // ${MARK} line-height-add
`,
      ],
      // 9. 위아래 여백 스크롤: TextView는 맨 위가 아니면 paddingTop 선, 맨 끝이 아니면 paddingBottom 선에서 글을 잘라 그려서,
      //    글이 디바이더 아래·서식 툴바 위의 여백 띠에서 사라졌다(툴바 위에 투명한 띠가 글을 가리는 것처럼 보였다).
      //    잘리는 여백 띠에 글(과 선택 영역)을 이어 그린다. 커서는 그리지 않는다 — 입력 중엔 커서 줄이 여백 안쪽에 머문다
      //    (iOS는 같은 번호의 textContainerInset 패치)
      [
        /(import android\.graphics\.Color\n)/,
        `$1import android.graphics.Canvas // ${MARK} scroll-padding-import
import android.graphics.Paint
import android.graphics.Path
`,
      ],
      [
        /(  override fun clearFocus\(\) \{)/,
        `  // ${MARK} scroll-padding
  private val pownStripHighlight = Path()
  private val pownStripPaint = Paint()

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val textLayout = layout ?: return
    val top = extendedPaddingTop
    val bottom = extendedPaddingBottom
    // TextView.onDraw와 같은 기준 — 글이 칸보다 길 때만 스크롤된다
    val maxScrollY = textLayout.height - (height - top - bottom)
    if (maxScrollY <= 0) return
    if (scrollY != 0 && top > 0) drawPownStrip(canvas, textLayout, scrollY, scrollY + top)
    if (scrollY != maxScrollY && bottom > 0) {
      drawPownStrip(canvas, textLayout, scrollY + height - bottom, scrollY + height)
    }
  }

  private fun drawPownStrip(
    canvas: Canvas,
    textLayout: android.text.Layout,
    from: Int,
    to: Int,
  ) {
    canvas.save()
    canvas.clipRect(
      compoundPaddingLeft + scrollX,
      from,
      width - compoundPaddingRight + scrollX,
      to,
    )
    canvas.translate(compoundPaddingLeft.toFloat(), extendedPaddingTop.toFloat())
    var highlight: Path? = null
    if (hasSelection()) {
      pownStripHighlight.reset()
      textLayout.getSelectionPath(selectionStart, selectionEnd, pownStripHighlight)
      pownStripPaint.color = highlightColor
      highlight = pownStripHighlight
    }
    textLayout.draw(canvas, highlight, pownStripPaint, 0)
    canvas.restore()
  }

$1`,
      ],
      [
        /(  var isRemovingMany: Boolean = false\n)/,
        `$1  var pownComposingEdit: Boolean = false // ${MARK} ime-flag
`,
      ],
    ],
  ],
  [
    // 7. 안드로이드 한글 조합: 키보드는 조합 중인 글자를 통째로 갈아 끼운다('핳' → '하하', 단어 전체 '하핳' → '하하하',
    //    스페이스에 조합 확정). 안드로이드 글 버퍼는 갈아 끼운 자리를 꼭 맞게 덮은 서식은 새 글자 전체로 늘리고, 그 안에
    //    든 서식은 지운다 — 굵게를 끈 뒤 친 글자까지 굵어지고, 늘어난 것만 잘라 내면 확정할 때 첫 글자 굵게가 지워졌다.
    //    iOS 3번처럼 갈아 끼우기 전 글자마다의 서식을 기억했다가, 원래 있던 자리는 원래 서식·늘어난 글자는 지금 칠 서식으로
    //    돌려놓는다. 조합 중인 글자를 갈아 끼울 때만 한다(선택 영역에 친 글자·붙여넣기는 라이브러리 그대로)
    "android/src/main/java/com/swmansion/enriched/textinput/EnrichedTextInputConnectionWrapper.kt",
    [
      [
        /(import android\.view\.inputmethod\.InputConnection\n)/,
        `import android.view.inputmethod.BaseInputConnection // ${MARK} ime-import
$1`,
      ],
      [
        /    val consumed = super\.setComposingText\(text, newCursorPosition\)\n/,
        `    markComposingEdit() // ${MARK} ime-compose
    val consumed =
      try {
        super.setComposingText(text, newCursorPosition)
      } finally {
        editText.pownComposingEdit = false
      }
`,
      ],
      [
        /    return super\.commitText\(text, newCursorPosition\)\n/,
        `    markComposingEdit() // ${MARK} ime-commit
    try {
      return super.commitText(text, newCursorPosition)
    } finally {
      editText.pownComposingEdit = false
    }
`,
      ],
      [
        /(  private fun dispatchKeyEventOrEnqueue)/,
        `  // ${MARK} ime-mark — 조합 중인 글자가 있을 때 들어온 글자만 조합 갈아 끼우기로 본다
  private fun markComposingEdit() {
    val editable = editText.text
    editText.pownComposingEdit = editable != null && BaseInputConnection.getComposingSpanStart(editable) != -1
  }

$1`,
      ],
    ],
  ],
  [
    "android/src/main/java/com/swmansion/enriched/textinput/watchers/EnrichedTextWatcher.kt",
    [
      [
        /(import android\.text\.Editable\n)/,
        `$1import android.text.Spannable // ${MARK} ime-import
import android.text.Spanned
import com.swmansion.enriched.textinput.spans.EnrichedSpans
import com.swmansion.enriched.textinput.styles.HtmlStyle
`,
      ],
      [
        /(  private var previousTextLength: Int = 0\n)/,
        `$1
  // ${MARK} ime-fields
  private var pownComposeStart = -1
  private var pownComposeLength = 0
  private var pownComposeStyles: Map<String, BooleanArray> = emptyMap()
`,
      ],
      [
        /(    previousTextLength = s\?\.length \?: 0\n)/,
        `$1    // ${MARK} ime-remember — 갈아 끼울 글자마다 어느 서식이 있었는지
    pownComposeStart = -1
    if (view.pownComposingEdit && s is Spanned && count > 0 && after > 0) {
      view.pownComposingEdit = false
      pownComposeStart = start
      pownComposeLength = after
      pownComposeStyles =
        EnrichedSpans.inlineSpans.mapValues { (_, config) ->
          BooleanArray(count) { i -> s.getSpans(start + i, start + i + 1, config.clazz).isNotEmpty() }
        }
    }
`,
      ],
      [
        /(    if \(view\.isDuringTransaction\) return\n)(    applyStyles\(s\)\n)/,
        `$1    restoreComposeStyles(s) // ${MARK} ime-restore-call
$2`,
      ],
      [
        /(  private fun applyStyles\(s: Editable\) \{)/,
        `  // ${MARK} ime-restore
  private fun restoreComposeStyles(s: Editable) {
    val start = pownComposeStart
    if (start == -1) return
    pownComposeStart = -1
    val end = (start + pownComposeLength).coerceAtMost(s.length)
    if (end <= start) return
    for ((style, config) in EnrichedSpans.inlineSpans) {
      val before = pownComposeStyles[style] ?: continue
      val typing = view.spanState?.getStart(style) != null
      val want = BooleanArray(end - start) { i -> if (i < before.size) before[i] else typing }
      val have = BooleanArray(end - start) { i -> s.getSpans(start + i, start + i + 1, config.clazz).isNotEmpty() }
      if (want.contentEquals(have)) continue
      // 앞뒤로 이어 붙은 같은 서식까지 한 번에 다시 깐다 — 서식이 글자마다 조각나지 않게
      val spans = s.getSpans((start - 1).coerceAtLeast(0), (end + 1).coerceAtMost(s.length), config.clazz)
      var low = start
      var high = end
      for (span in spans) {
        low = minOf(low, s.getSpanStart(span))
        high = maxOf(high, s.getSpanEnd(span))
      }
      val covered =
        BooleanArray(high - low) { i ->
          val at = low + i
          if (at in start until end) want[at - start] else spans.any { s.getSpanStart(it) <= at && at < s.getSpanEnd(it) }
        }
      for (span in spans) s.removeSpan(span)
      var from = 0
      while (from < covered.size) {
        if (!covered[from]) {
          from++
          continue
        }
        var to = from
        while (to < covered.size && covered[to]) to++
        val span = config.clazz.getDeclaredConstructor(HtmlStyle::class.java).newInstance(view.htmlStyle)
        s.setSpan(span, low + from, low + to, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        from = to
      }
    }
  }

$1`,
      ],
    ],
  ],
  [
    // 8. 안드로이드 제목 줄 높이: 줄 간격(위 line-height-apply)은 본문 글꼴로 잡혀 있어 제목 줄은 iOS보다 줄마다 0.3
    //    짧았다(20 → 29.7, 18 → 26.7). 제목 줄 높이를 iOS(제목 글자 × sb-m 자연 줄 1.199 × 1.25 — components/rich-note.tsx
    //    읽기 화면과 같은 식)에 가장 가까운 픽셀로 정한다(20 → 79px = 30.1, 18 → 71px = 27.05 — iOS 29.98·26.98)
    "android/src/main/java/com/swmansion/enriched/textinput/spans/EnrichedInputH1Span.kt",
    [
      [
        /(import com\.swmansion\.enriched\.common\.spans\.EnrichedH1Span\n)/,
        `import android.graphics.Paint // ${MARK} heading-line-import
import android.text.TextPaint
import android.text.style.LineHeightSpan
import com.facebook.react.uimanager.PixelUtil
$1`,
      ],
      [
        /(  EnrichedInputSpan \{\n)(  override val dependsOnHtmlStyle: Boolean = true\n)/,
        `  EnrichedInputSpan,
  LineHeightSpan.WithDensity {
$2  private val pownSize = style.h1FontSize // ${MARK} heading-line

  override fun chooseHeight(text: CharSequence, start: Int, end: Int, spanstartv: Int, lineHeight: Int, fm: Paint.FontMetricsInt) = Unit

  override fun chooseHeight(
    text: CharSequence,
    start: Int,
    end: Int,
    spanstartv: Int,
    lineHeight: Int,
    fm: Paint.FontMetricsInt,
    paint: TextPaint,
  ) = pownHeadingLine(pownSize, fm, paint)
`,
      ],
      [
        /(\nclass EnrichedInputH1Span\()/,
        `
// ${MARK} heading-line-fun — 제목 줄 하나의 높이를 iOS에 가장 가까운 픽셀로 (EnrichedInputH2Span도 쓴다)
internal fun pownHeadingLine(
  sizePx: Int,
  fm: Paint.FontMetricsInt,
  paint: TextPaint,
) {
  // paint는 에디터 본문 글꼴 — EnrichedTextInputView applyPownLineSpacing이 줄마다 더하는 값을 다시 잡는다
  // (StaticLayout은 그 값을 반올림해 descent 아래에 붙인다)
  val base = paint.fontMetricsInt
  val extra = Math.round(1.5f * paint.textSize - (base.descent - base.ascent))
  // 제목 크기는 sp를 픽셀로 올림해 받는다(HtmlStyle parseFloat) — 정수 sp로 되돌려 iOS 줄 높이를 잡는다
  // ponytail: 제목 크기가 정수 sp라고 본다(components/rich-note.tsx M.h1·h2) — 소수로 바꾸면 이 반올림을 뺄 것
  val spPx = PixelUtil.toPixelFromSP(1f)
  val target = Math.round(Math.round(sizePx / spPx) * spPx * 1.199f * 1.25f)
  // 글자 자리(ascent)는 그대로 두고 아래만 늘이거나 줄인다 — iOS도 줄 간격을 글자 아래에 둔다
  fm.descent = fm.ascent + target - extra
}
$1`,
      ],
    ],
  ],
  [
    "android/src/main/java/com/swmansion/enriched/textinput/spans/EnrichedInputH2Span.kt",
    [
      [
        /(import com\.swmansion\.enriched\.common\.spans\.EnrichedH2Span\n)/,
        `import android.graphics.Paint // ${MARK} heading-line-import
import android.text.TextPaint
import android.text.style.LineHeightSpan
$1`,
      ],
      [
        /(  EnrichedInputSpan \{\n)(  override val dependsOnHtmlStyle: Boolean = true\n)/,
        `  EnrichedInputSpan,
  LineHeightSpan.WithDensity {
$2  private val pownSize = htmlStyle.h2FontSize // ${MARK} heading-line

  override fun chooseHeight(text: CharSequence, start: Int, end: Int, spanstartv: Int, lineHeight: Int, fm: Paint.FontMetricsInt) = Unit

  override fun chooseHeight(
    text: CharSequence,
    start: Int,
    end: Int,
    spanstartv: Int,
    lineHeight: Int,
    fm: Paint.FontMetricsInt,
    paint: TextPaint,
  ) = pownHeadingLine(pownSize, fm, paint)
`,
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
