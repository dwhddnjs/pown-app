const {
  withDangerousMod,
  withMainApplication,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// 안드로이드에서 sb-l을 굵기별 글꼴 패밀리(400 = SB_L, 700 = 굵은 면)로 등록한다.
// expo-font는 글꼴마다 NORMAL 한 면만 등록해서, 전체 노트 에디터(react-native-enriched)의 굵게·제목
// (StyleSpan BOLD)이 sb-l을 가짜로 두껍게 그려 글자가 뭉개졌다. 패밀리로 등록하면 진짜 굵은 면을 고른다.
// RN은 addCustomFont로 넣은 글꼴을 expo-font보다 먼저 찾는다(ReactFontManager.getTypeface) — 400 면은
// 같은 파일이라 앱의 다른 sb-l 글자는 그대로다.
// 굵은 면은 iOS 에디터·읽기 화면과 같은 sb-m이다 (scripts/patch-enriched.js, components/rich-note.tsx RICH_NOTE_BOLD)
const FONTS = {
  sb_l_regular: "SB_L.otf",
  sb_l_bold: "SB_M.otf",
};

const FAMILY_XML = `<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:app="http://schemas.android.com/apk/res-auto">
  <font app:fontStyle="normal" app:fontWeight="400" app:font="@font/sb_l_regular" />
  <font app:fontStyle="normal" app:fontWeight="700" app:font="@font/sb_l_bold" />
</font-family>
`;

const withFontResources = (config) =>
  withDangerousMod(config, [
    "android",
    (cfg) => {
      const fontDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/res/font",
      );
      fs.mkdirSync(fontDir, { recursive: true });
      for (const [name, file] of Object.entries(FONTS)) {
        fs.copyFileSync(
          path.join(cfg.modRequest.projectRoot, "assets/fonts", file),
          path.join(fontDir, `${name}.otf`),
        );
      }
      fs.writeFileSync(path.join(fontDir, "sb_l.xml"), FAMILY_XML);
      return cfg;
    },
  ]);

const withFontRegistration = (config) =>
  withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (src.includes("addCustomFont")) return cfg;
    src = src.replace(
      /^import android.app.Application$/m,
      "import android.app.Application\nimport com.facebook.react.common.assets.ReactFontManager",
    );
    src = src.replace(
      /super\.onCreate\(\)/,
      'super.onCreate()\n    ReactFontManager.getInstance().addCustomFont(this, "sb-l", R.font.sb_l)',
    );
    cfg.modResults.contents = src;
    return cfg;
  });

module.exports = (config) => withFontRegistration(withFontResources(config));
