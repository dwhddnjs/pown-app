import {
  isAppOwnedMedia,
  isMediaMissing,
  persistMediaLocally,
  removeAppOwnedMedia,
  resolveMediaUri,
} from "@/lib/media";
import { storage } from "@/lib/storage";
import { WorkoutTypes } from "@/types/workout";
import * as VideoThumbnails from "expo-video-thumbnails";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// AI 자세 분석 리포트. 영상당 한 번만 만들고 다시 만들지 않는다.
// 영상 아이템 "안"에 넣어 두는 게 핵심 — setRemoveVideo의 filter가 영상을 지울 때
// 리포트도 같이 사라진다. 별도 맵으로 빼면 지울 때마다 정리 코드가 따라붙는다.
export type ShortsReportTypes = {
  workout: string;
  bodyPart: WorkoutTypes;
  // 0~100. 종목이 다르면 서로 비교할 수 있는 수치가 아니다 — 추이 차트로 쓰지 말 것
  score: number;
  // 부상 위험이 보일 때만. 없으면 배너를 그리지 않는다
  risk?: string;
  checkpoints: { joint: string; status: "good" | "caution"; note: string }[];
  good: string[];
  bad: string[];
  improve: string[];
  drills: string[];
  // 프레임만으로 판단이 안 되는 각도였을 때의 재촬영 안내
  camera?: string;
  createdAt: string;
};

export type ShortsVideoTypes = {
  id: number;
  thumbnail: string;
  video: string;
  createdAt: string;
  title?: string;
  content?: string;
  report?: ShortsReportTypes;
};

// 파일 검사는 목록당 한 번이면 된다. 목록이 통째로 바뀌면(복원·초기화) 다시 검사한다.
// 상태로 두면 persist가 같이 저장해 다음 실행에서 영영 안 돌게 된다.
let hasRepaired = false;

// 파일 조회를 몇 개씩 끊어 돌지
const REPAIR_BATCH = 8;

type ShortsStoreTypes = {
  videos: ShortsVideoTypes[];
  // 영상 프레임이 외부 AI로 나가도 되는지 — 첫 분석 전에 한 번만 묻는다
  aiConsent: boolean;
  setAddVideo: (video: ShortsVideoTypes) => void;
  setReport: (videoId: number, report: ShortsReportTypes) => void;
  setAiConsent: () => void;
  setMemo: (videoId: number, memo: { title: string; content: string }) => void;
  setRemoveVideo: (videoId: number) => void;
  onSetVideos: (videos: ShortsVideoTypes[]) => void;
  onRepairVideos: () => Promise<void>;
  onResetVideo: () => void;
};

export const useShortsStore = create<ShortsStoreTypes>()(
  persist(
    (set, get) => ({
      videos: [],
      aiConsent: false,
      setAiConsent: () => set({ aiConsent: true }),
      setAddVideo: (video) =>
        set((prev) => ({
          ...prev,
          videos: [...prev.videos, video],
        })),
      setMemo: (videoId, memo) =>
        set((prev) => {
          const index = prev.videos.findIndex((item) => item.id === videoId);
          if (index === -1) return prev;
          const videos = [...prev.videos];
          videos[index] = { ...videos[index], ...memo };
          return { ...prev, videos };
        }),
      // 분석 중에 영상이 지워졌을 수 있다 — 못 찾으면 조용히 버린다
      setReport: (videoId, report) =>
        set((prev) => {
          const index = prev.videos.findIndex((item) => item.id === videoId);
          if (index === -1) return prev;
          const videos = [...prev.videos];
          videos[index] = { ...videos[index], report };
          return { ...prev, videos };
        }),
      setRemoveVideo: (videoId) => {
        const target = get().videos.find((item) => item.id === videoId);
        removeAppOwnedMedia(target?.video);
        removeAppOwnedMedia(target?.thumbnail);
        set((prev) => ({
          ...prev,
          videos: prev.videos.filter((item) => item.id !== videoId),
        }));
      },
      onSetVideos: (videos) => {
        // 목록을 통째로 갈아끼웠다(복원) — 새 항목들은 아직 검사 전이다
        hasRepaired = false;
        set({ videos });
      },
      // 목록엔 남아 있는데 실제 파일이 없는 항목을 정리한다.
      // 구 버전은 썸네일을 캐시 절대경로로 저장해서, 앱 업데이트로 컨테이너 UUID가
      // 바뀌면 파일이 통째로 사라진다 → 그리드가 전부 투명해져 "빈 화면"으로 보인다
      // (항목이 있으니 empty 화면도 안 뜬다). 영상에서 썸네일을 다시 뽑아 되살린다.
      onRepairVideos: async () => {
        const origin = get().videos;
        // 빈 목록이면 검사할 게 없다 — 아직 하이드레이션 전일 수 있으니 플래그도 세우지 않는다
        if (hasRepaired || origin.length === 0) return;
        hasRepaired = true;

        const repairOne = async (video: ShortsVideoTypes) => {
          // 앱 소유 영상이 확실히 사라졌으면 되살릴 방법이 없는 죽은 기록이다. 샌드박스
          // 안이라 판정이 확실하다 — 구 데이터의 사진첩 경로(ph://·DCIM)는 권한 때문에
          // 없다고 잘못 나올 수 있어 지우지 않는다.
          if (
            isAppOwnedMedia(video.video) &&
            (await isMediaMissing(video.video))
          ) {
            removeAppOwnedMedia(video.thumbnail);
            return null;
          }
          if (await isMediaMissing(video.thumbnail)) {
            try {
              const { uri } = await VideoThumbnails.getThumbnailAsync(
                resolveMediaUri(video.video),
                { time: 0 },
              );
              return {
                ...video,
                thumbnail: await persistMediaLocally(
                  uri,
                  `shorts-thumb-${video.id}.jpg`,
                ),
              };
            } catch {
              // 썸네일만 못 살렸다 — 항목은 남기고 그리드가 대체 타일로 그린다
            }
          }
          return video;
        };

        // 한 번에 다 던지면 탭을 여는 프레임에 파일 조회가 몰려 화면이 멈칫한다
        const repaired: (ShortsVideoTypes | null)[] = [];
        for (let i = 0; i < origin.length; i += REPAIR_BATCH) {
          repaired.push(
            ...(await Promise.all(
              origin.slice(i, i + REPAIR_BATCH).map(repairOne),
            )),
          );
        }

        // 검사 중에 녹화가 끝나 목록이 바뀌었으면 옛 목록으로 덮어쓰지 않는다
        if (get().videos !== origin) return;
        if (repaired.every((video, index) => video === origin[index])) return;
        set({
          videos: repaired.filter(
            (video): video is ShortsVideoTypes => video !== null,
          ),
        });
      },
      onResetVideo: () => {
        get().videos.forEach((video) => {
          removeAppOwnedMedia(video.video);
          removeAppOwnedMedia(video.thumbnail);
        });
        hasRepaired = false;
        set({
          videos: [],
        });
      },
    }),
    {
      name: "shorts",
      storage: createJSONStorage(() => storage),
    },
  ),
);
