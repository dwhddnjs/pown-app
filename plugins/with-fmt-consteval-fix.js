const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// RN 0.79이 가져오는 fmt 11.0.2는 clang 21(Xcode 26)의 엄격한 consteval 검사를 통과 못 한다.
// pod install 직후 fmt/base.h 맨 위에 FMT_USE_CONSTEVAL=0을 박아 컴파일타임 포맷 검사를 끈다.
// ios/는 CNG로 매번 재생성되므로 Podfile 직접 수정 대신 플러그인으로 유지한다.
const SNIPPET = `
    fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      fmt_src = File.read(fmt_base)
      unless fmt_src.include?('POWN_FMT_CONSTEVAL_PATCH')
        File.chmod(0644, fmt_base)
        fmt_src = fmt_src.gsub('#  define FMT_USE_CONSTEVAL 1', '#  define FMT_USE_CONSTEVAL 0')
        File.write(fmt_base, "// POWN_FMT_CONSTEVAL_PATCH\\n" + fmt_src)
      end
    end
`;

module.exports = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      const src = fs.readFileSync(podfile, "utf8");
      if (src.includes("POWN_FMT_CONSTEVAL_PATCH")) return cfg;
      fs.writeFileSync(
        podfile,
        src.replace("  post_install do |installer|", "  post_install do |installer|\n" + SNIPPET)
      );
      return cfg;
    },
  ]);
