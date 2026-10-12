// 아래에서 올라오는 시트 모달(UIKit page sheet). 제목·닫기 버튼은 네이티브 내비 바가 그린다.
// 안드로이드는 같은 모양을 머티리얼 바텀시트로 낸다 (modal-presentation.android.tsx)
const MODAL_PRESENTATION = { presentation: "modal" as const };

export const useModalPresentation = () => MODAL_PRESENTATION;
