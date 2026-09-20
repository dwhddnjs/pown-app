// 리포트를 받기 전에 보는 리워드 광고.
import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
// expo
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

// 광고 단위 ID는 비밀이 아니다 — 모든 앱 바이너리에 공개로 들어가고 광고 요청마다
// 평문으로 나간다. 그래서 .env가 아니라 여기 둔다: 환경변수로 두면 EAS에 등록을
// 빠뜨렸을 때 프로덕션이 조용히 테스트 광고로 나가 수익이 0이 되는데 에러가 안 난다.
//
// 개발 중에는 무조건 테스트 광고다. 실제 광고를 dev 빌드로 보면 무효 트래픽으로
// AdMob 계정이 정지될 수 있다.
const REWARDED_ID = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-6495300075044721/2721484297";

// 광고가 안 붙는데 계속 기다리면 리포트를 영영 못 본다
const LOAD_TIMEOUT_MS = 8_000;
// 광고가 뜬 뒤 CLOSED/ERROR가 영영 안 오는 경우가 있다(앱이 백그라운드를 다녀오거나
// SDK가 이벤트를 흘리는 경우). 로드 타임아웃만 풀고 끝내면 Promise가 영원히 열려 있어
// 스캔 오버레이가 화면을 덮은 채 갇힌다 — 표시 단계에도 상한을 둔다.
const SHOW_TIMEOUT_MS = 180_000;

// 앱 시작이 아니라 첫 광고 직전에 부른다 — AI를 안 쓰는 사용자에게 실행하자마자
// 추적 권한을 묻지 않기 위해서다. ATT 응답 "전에" initialize하면 IDFA 없이
// 초기화되므로 순서를 지킨다. 한 번만 돌면 되므로 약속을 캐시한다.
let initPromise: Promise<void> | undefined;

export const initAds = () => {
  // 실패한 약속을 그대로 캐시하면 한 번 실패한 뒤 앱을 끌 때까지 광고가 영영 안 붙는다
  initPromise ??= (async () => {
    try {
      await requestTrackingPermissionsAsync();
      await mobileAds().initialize();
    } catch {
      // 광고 초기화 실패로 앱이 멈출 이유는 없다 — 다음 호출에서 다시 시도한다
      initPromise = undefined;
    }
  })();
  return initPromise;
};

// ponytail: 로드 실패·타임아웃이면 그냥 통과시킨다. 광고가 안 떠서 리포트를 못 보는
// 게 최악이다. 광고를 진짜 게이트로 만들어야 하면 여기서 false를 반환하게 바꾼다.
export const showRewardedAd = async () => {
  await initAds();
  return new Promise<void>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const offHandlers: (() => void)[] = [];

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      offHandlers.forEach((off) => off());
      resolve();
    };

    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_ID);

      offHandlers.push(
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          // 여기서부터는 사용자가 보는 시간이라 로드 상한은 풀되, 표시 단계 상한으로 바꿔 건다
          clearTimeout(timer);
          timer = setTimeout(finish, SHOW_TIMEOUT_MS);
          ad.show().catch(finish);
        }),
        ad.addAdEventListener(AdEventType.CLOSED, finish),
        ad.addAdEventListener(AdEventType.ERROR, finish),
      );

      timer = setTimeout(finish, LOAD_TIMEOUT_MS);
      ad.load();
    } catch {
      finish();
    }
  });
};
