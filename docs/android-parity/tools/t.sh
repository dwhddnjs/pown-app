# 두 기기 나란히 비교용 셸 함수 — `SP=<스크래치패드> source docs/android-parity/tools/t.sh`
# iOS 좌표는 pt(시뮬레이터 창 1:1, 제목 표시줄 52), 안드로이드는 dp(Pixel 6, 2.625배). 스크린샷은 $SP/shots/<이름>.png
#   itap/ilong/iswipe x y …   iOS 누르기·길게·끌기 (cliclick, 손쉬운 사용 권한 필요)
#   atap/apress/aswipe x y …  안드로이드 (adb input)
#   ishot/ashot <이름>         캡처(+축소본 <이름>s.png)
#   tapt "글자" [n] [both|a|i] [top|bottom|center|screen]  안드로이드 화면에서 글자로 찾아 두 기기 같은 자리를 누른다
#        (iOS 좌표는 안전영역 위끝 기준 top / 아래끝 bottom / 화면 중앙 center / 화면 아래끝 screen 로 옮긴다)
#   afg / aok                 안드로이드 앱이 앞에 있는지 확인·다시 띄우기
# source this. iOS pt 좌표 / 안드로이드 dp 좌표
SP=${SP:-$(mktemp -d)}  # 스크린샷·덤프를 둘 곳 (세션 스크래치패드를 넘겨 쓰면 좋다)
SIM=${SIM:-2C2ADC51-E0FB-4BF5-81AF-CCF7FCD9B7B4}  # iPhone 17 Pro 시뮬레이터
ADB=~/Library/Android/sdk/platform-tools/adb
iwin() { read OX OY <<<"$(osascript -e 'tell application "System Events" to tell process "Simulator" to return position of first window' | tr -d ',')"; OY=$((OY+52)); }
itap() { iwin; osascript -e 'tell application "Simulator" to activate'; sleep 0.3; X=$(python3 -c "print(round($OX+$1))"); Y=$(python3 -c "print(round($OY+$2))"); cliclick m:$X,$Y w:60 c:$X,$Y; }
ilong() { iwin; osascript -e 'tell application "Simulator" to activate'; sleep 0.3; X=$(python3 -c "print(round($OX+$1))"); Y=$(python3 -c "print(round($OY+$2))"); cliclick m:$X,$Y dd:$X,$Y w:${3:-900} du:$X,$Y; }
iswipe() { iwin; osascript -e 'tell application "Simulator" to activate'; sleep 0.3; python3 - "$OX" "$OY" "$@" <<'PY'
import sys,subprocess
ox,oy,x1,y1,x2,y2=map(float,sys.argv[1:7]); n=int(sys.argv[7]) if len(sys.argv)>7 else 12
P=lambda x,y:f"{round(ox+x)},{round(oy+y)}"
cmd=["cliclick",f"m:{P(x1,y1)}",f"dd:{P(x1,y1)}"]
for i in range(1,n+1): cmd+=["w:16",f"dm:{P(x1+(x2-x1)*i/n,y1+(y2-y1)*i/n)}"]
cmd+=["w:300" if "--hold" in sys.argv else "w:16",f"du:{P(x2,y2)}"]
subprocess.run(cmd)
PY
}
ishot() { xcrun simctl io $SIM screenshot $SP/shots/$1.png >/dev/null 2>&1; sips -Z ${2:-900} $SP/shots/$1.png --out $SP/shots/$1s.png >/dev/null; }
atap() { $ADB shell input tap $(python3 -c "print(round($1*2.625), round($2*2.625))"); }
apress() { $ADB shell input swipe $(python3 -c "print(round($1*2.625), round($2*2.625), round($1*2.625), round($2*2.625))") ${3:-120}; }
aswipe() { $ADB shell input swipe $(python3 -c "print(*[round(v*2.625) for v in ($1,$2,$3,$4)])") ${5:-300}; }
ashot() { $ADB exec-out screencap -p > $SP/shots/$1.png; sips -Z ${2:-900} $SP/shots/$1.png --out $SP/shots/$1s.png >/dev/null; }
pair() { python3 - "$SP/shots/$1.png" "$SP/shots/$2.png" "$SP/shots/$1-$2.png" <<'PY'
import sys
from PIL import Image
a=Image.open(sys.argv[1]).convert('RGB'); b=Image.open(sys.argv[2]).convert('RGB')
# pt/dp 1:1 로 맞춰 안전영역 위끝 정렬 (iOS 62 / 안드 48.76) — 2배 해상도
S=2
a=a.resize((round(a.width/3*S),round(a.height/3*S))); b=b.resize((round(b.width/2.625*S),round(b.height/2.625*S)))
off=round((62-48.76)*S)
H=max(a.height,b.height+off)
c=Image.new('RGB',(a.width+b.width+10,H),'red')
c.paste(a,(0,0)); c.paste(b,(a.width+10,off))
c.save(sys.argv[3])
PY
}
aok() { $ADB shell input keyevent 4 >/dev/null 2>&1; $ADB shell input keyevent 3; sleep 0.5; $ADB shell am start -n com.dwhddnjs.pown/.MainActivity >/dev/null; sleep 1.5; }
afg() { $ADB shell dumpsys window | grep -q "mCurrentFocus.*pown" || { echo "!! android not foreground"; aok; }; }
# 안드로이드 화면에서 글자(부분 일치)로 찾아 그 중심을 두 기기에 같이 누른다 (iOS는 안전영역 기준 같은 자리, x는 폭 비율)
# usage: tapt "글자" [n번째(0)] [only=a|i|both]
tapt() { afg; $ADB shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; $ADB pull /sdcard/u.xml $SP/u.xml >/dev/null 2>&1
  read AX AY <<<"$(python3 - "$1" "${2:-0}" "$SP/u.xml" <<'PY'
import re,sys
s=open(sys.argv[3]).read()
hits=[]
for m in re.finditer(r'<node [^>]*?text="([^"]*)"[^>]*?content-desc="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',s):
    t,d,x0,y0,x1,y1=m.groups()
    if sys.argv[1] in t or sys.argv[1] in d: hits.append(((int(x0)+int(x1))/2/2.625,(int(y0)+int(y1))/2/2.625))
h=hits[int(sys.argv[2])] if len(hits)>int(sys.argv[2]) else (-1,-1)
print(round(h[0],1),round(h[1],1))
PY
)"
  if [ "$AX" = "-1" ]; then echo "!! not found: $1"; return 1; fi
  [ "${3:-both}" != i ] && atap $AX $AY
  if [ "${4:-top}" = center ]; then IY=$(python3 -c "print(round($AY-20.14,1))"); IX=$(python3 -c "print(round($AX-4.5,1))"); elif [ "${4:-top}" = screen ]; then IY=$(python3 -c "print(round($AY-40.29,1))"); IX=$(python3 -c "print(round($AX*402/411,1))"); elif [ "${4:-top}" = bottom ]; then IY=$(python3 -c "print(round(840-(890.29-$AY),1))"); IX=$(python3 -c "print(round(201+($AX-205.5),1))"); else IY=$(python3 -c "print(round($AY-48.76+62,1))"); IX=$(python3 -c "print(round($AX*402/411,1))"); fi
  [ "${3:-both}" != a ] && itap $IX $IY
  echo "tapped '$1' at and($AX,$AY)"; }
