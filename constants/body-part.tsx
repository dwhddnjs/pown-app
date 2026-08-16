import { WORKOUT_TYPE_LIST, WorkoutTypes } from "@/types/workout";
// icon
import Arm from "@/assets/images/svg/arm_icon.svg";
import Back from "@/assets/images/svg/back_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";

// 부위 → SVG 아이콘. 부위 선택 화면, 운동 카드, 달력, 부위별 카운트가 모두 같은
// 아이콘을 쓰는데 예전엔 파일마다 5개를 각각 import하고 switch/객체를 다시 만들었다.
export const BODY_PART_ICON: Record<WorkoutTypes, typeof Back> = {
  back: Back,
  chest: Chest,
  shoulder: Shoulder,
  leg: Leg,
  arm: Arm,
};

// 부위 선택 UI가 그대로 map 할 수 있는 목록 (표시 순서는 WORKOUT_TYPE_LIST가 정한다).
// 라벨은 언어에 따라 달라지므로 여기 담지 않고 화면에서 tBodyPart로 만든다.
export const BODY_PART_ITEMS = WORKOUT_TYPE_LIST.map((type) => ({
  type,
  icon: BODY_PART_ICON[type],
}));
