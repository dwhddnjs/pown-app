// sonner-native 0.15 버그 패치 — npm install 뒤(postinstall) 돈다.
// 토스트는 끄는 중(isDragging)이면 자동으로 안 닫히는데, 그 표시를 팬 제스처의 onBegin(손가락이 닿기만
// 해도)에서 켜고 onFinalize에서 끈다. 그런데 (1) iOS는 탭이 이기면 팬의 onFinalize가 불리지 않고
// (2) 조금 끈 경우(16 미만)는 onFinalize가 끄기 전에 return해서, 토스트를 한 번 누르면 헤더(뒤로·저장
// 버튼)를 덮은 채 영영 안 사라졌다(iOS·안드로이드 둘 다). 0.27에서 (2)는 고쳐졌지만 reanimated 4가
// 필요하다 → 실제로 끌기 시작했을 때(onStart — 시작한 제스처는 반드시 onFinalize까지 간다)만 켜고,
// 그 return을 지운다(아래 else가 같은 원위치 애니메이션을 하고 onFinalize를 부른다).
// 버전을 올리면 이 스크립트를 지울 것
const fs = require("fs");
const path = require("path");

const PATCHES = [
  [/(Gesture\.Pan\(\)\.)onBegin\(/, "$1onStart("],
  [
    /(if \(Math\.abs\(translate\.value\) < 16\) \{\s*translate\.value = [^;]*;)\s*return;/,
    "$1",
  ],
];

for (const build of ["module", "commonjs"]) {
  const file = path.join(
    __dirname,
    "../node_modules/sonner-native/lib",
    build,
    "gestures.js",
  );
  if (!fs.existsSync(file)) continue;
  let source = fs.readFileSync(file, "utf8");
  const applied = PATCHES.filter(([from]) => from.test(source));
  for (const [from, to] of applied) source = source.replace(from, to);
  fs.writeFileSync(file, source);
  console.log(
    `sonner-native ${build}: 토스트 자동 닫힘 패치 ${applied.length}/${PATCHES.length}` +
      (applied.length ? "" : " (이미 패치했거나 버전이 바뀜)"),
  );
}
