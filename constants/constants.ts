const planData = {
  id: 1,
  type: "back",
  workout: "바벨로우",
  totalSet: 10,
  maxWeight: {
    weight: 100,
    count: 1,
  },
  createdAt: "9시 30분",
  condition: ["화남", "피곤함", "우울함", "신남"],
  comment: "아 진짜 개빡치네 너무 아쉽게 못 들었음",
}

export const equipmentData: string[] = [
  "바벨",
  "덤벨",
  "머신",
  "스미스",
  "케이블",
  "맨몸",
]

export const workoutData: Record<
  "back" | "chest" | "shoulder" | "leg" | "arm",
  string[]
> = {
  back: [
    "데드리프트",
    "로우",
    "풀업",
    "친업",
    "랫풀다운",
    "암풀다운",
    "컨벤셔널데드",
    "루마니안데드",
    "렉풀",
    "티바로우",
    "하이로우",
    "로우로우",
    "원암로우",
    "벤트오버로우",
    "펜들레이로우",
    "시티드로우",
    "프론트로우",
    "슈러그",
  ],
  chest: [
    "벤치프레스",
    "인클라인프레스",
    "디클라인프레스",
    "체스트프레스",
    "클로즈그립프레스",
    "와이드프레스",
    "시티드프레스",
    "플랫프레스",
    "팩덱플라이",
    "플라이",
    "딥스",
    "풀오버",
  ],
  shoulder: [
    "오버헤드프레스",
    "밀리터리프레스",
    "숄더프레스",
    "푸쉬프레스",
    "비하인드넥프레스",
    "프론트레이즈",
    "사이드레터럴레이즈",
    "벤트오버레이즈",
    "업라이트로우",
    "페이스풀",
  ],
  leg: [
    "스쿼트",
    "백스쿼트",
    "핵스쿼트",
    "브이스쿼트",
    "레그프레스",
    "레그익스텐션",
    "레그컬",
    "런지",
    "스티프데드",
    "스모데드",
    "인어싸이",
    "아웃싸이",
    "프론트스쿼트",
    "스플릿스쿼트",
    "와이드스쿼트",
    "펜듈럼스쿼트",
    "힙쓰러스트",
    "카프레이즈",
  ],
  arm: [
    "컬",
    "해머컬",
    "푸쉬다운",
    "스컬크러셔",
    "삼두익스텐션",
    "리버스컬",
    "리스트컬",
    "프리쳐컬",
    "스파이더컬",
    "리버스리스트컬",
    "컨센트레이션컬",
  ],
}

export const workoutData2: {
  [key: string]: any
} = {
  back: {
    babel: [
      "로우",
      "벤트오버로우",
      "펜들레이로우",
      "컨벤셔널데드리프트",
      "루마니안데드리프트",
      "슈러그",
      "티바로우",
      "렉풀",
    ],
    dumbbell: ["원암로우", "로우로우", "슈러그", "투암로우", "데드리프트"],
    smith: ["로우", "루마니안데드리프트", "슈러그", "렉풀"],
    machine: [
      "로우로우",
      "하이로우",
      "랫풀다운",
      "티바로우",
      "시티드로우",
      "풀업",
      "프론트로우",
      "벤트오버로우",
      "아이솔레이트로우",
      "암풀다운",
      "친업",
    ],
    cable: [
      "로우로우",
      "하이로우",
      "랫풀다운",
      "티바로우",
      "시티드로우",
      "암풀다운",
    ],
  },
  chest: {
    babel: [
      "벤치프레스",
      "디클라인프레스",
      "인클라인프레스",
      "클로즈그립프레스",
      "풀오버",
    ],
    dumbbell: [
      "벤치프레스",
      "디클라인프레스",
      "인클라인프레스",
      "클로즈그립프레스",
      "풀오버",
      "플라이",
    ],
    smith: [
      "벤치프레스",
      "디클라인프레스",
      "인클라인프레스",
      "클로즈그립프레스",
    ],
    machine: [
      "펙덱플라이",
      "딥스",
      "체스트프레스",
      "시티드프레스",
      "인클라인프레스",
      "디클라인프레스",
      "와이드프레스",
      "플랫프레스",
    ],
    cable: [
      "플라이",
      "체스트프레스",
      "시티드프레스",
      "와이드프레스",
      "인클라인프레스",
      "디클라인프레스",
    ],
  },
  shoulder: {
    babel: [
      "오버헤드프레스",
      "밀리터리프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "비하인드넥프레스",
      "푸쉬프레스",
    ],
    dumbbell: [
      "숄더프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "벤트오버레이즈",
      "업라이트로우",
      "푸쉬프레스",
    ],
    smith: [
      "오버헤드프레스",
      "밀리터리프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "비하인드넥프레스",
    ],
    machine: [
      "숄더프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "벤트오버레이즈",
      "업라이트로우",
    ],
    cable: [
      "숄더프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "벤트오버레이즈",
      "업라이트로우",
      "페이스풀",
    ],
  },
  leg: {
    babel: [
      "스쿼트",
      "하이바스쿼트",
      "로우바스쿼트",
      "프론트스쿼트",
      "스플릿스쿼트",
      "런지",
      "힙쓰러스트",
      "와이드스쿼트",
      "스모데드리프트",
      "스티프데드리프트",
    ],
    dumbbell: [
      "스쿼트",
      "하이바스쿼트",
      "로우바스쿼트",
      "프론트스쿼트",
      "스플릿스쿼트",
      "런지",
      "힙쓰러스트",
      "와이드스쿼트",
      "스모데드리프트",
      "스티프데드리프트",
    ],
    smith: [
      "스쿼트",
      "하이바스쿼트",
      "로우바스쿼트",
      "프론트스쿼트",
      "스플릿스쿼트",
      "런지",
      "힙쓰러스트",
      "와이드스쿼트",
      "스모데드리프트",
      "스티프데드리프트",
    ],
    machine: [
      "숄더프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "벤트오버레이즈",
      "업라이트로우",
    ],
    cable: [
      "숄더프레스",
      "사이드레터럴레이즈",
      "프론트레이즈",
      "벤트오버레이즈",
      "업라이트로우",
      "페이스풀",
    ],
  },
  arm: [
    "해머컬",
    "바벨컬",
    "덤벨컬",
    "케이블컬",
    "리버스컬",
    "리스트컬",
    "리버스리스트컬",
  ],
}

export const setData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
export const setTypeData = ["웜업", "본 세트", "PR", "연습"]
export const countData = [
  "1 + α",
  "2 + α",
  "3 + α",
  "4 + α",
  "5 + α",
  "6 + α",
  "7 + α",
  "8 + α",
  "9 + α",
  "10 + α",
  "11 + α",
  "12 + α",
  "13 + α",
  "14 + α",
  "15 + α",
]

export const conditionData = [
  {
    id: 1,
    condition: "좋음",
  },
  {
    id: 2,
    condition: "피곤함",
  },
  {
    id: 3,
    condition: "화남",
  },
  {
    id: 4,
    condition: "아픔",
  },
  {
    id: 5,
    condition: "슬픔",
  },
  {
    id: 6,
    condition: "신남",
  },
  {
    id: 7,
    condition: "상쾌함",
  },
  {
    id: 8,
    condition: "양호함",
  },
  {
    id: 9,
    condition: "짜증남",
  },
]

export const mockupData = [
  {
    condition: ["화남", "피곤함", "좋음"],
    content: "Asdasdasd",
    createdAt: "2025.03.14 06:58:34",
    equipment: "덤벨",
    id: 9,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.11.14 06:58:34",
    weight: "60",
    workout: "체스트프레스",
  },
  {
    condition: ["화남", "피곤함", "좋음"],
    content: "Asdasdasd",
    createdAt: "2025.02.14 06:58:34",
    equipment: "덤벨",
    id: 9,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.11.14 06:58:34",
    weight: "60",
    workout: "체스트프레스",
  },
  {
    condition: ["화남", "피곤함", "좋음"],
    content: "Asdasdasd",
    createdAt: "2025.01.14 06:58:34",
    equipment: "덤벨",
    id: 8,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.11.14 06:58:34",
    weight: "60",
    workout: "체스트프레스",
  },
  {
    condition: ["화남", "피곤함", "좋음"],
    content: "Asdasdasd",
    createdAt: "2024.12.14 06:58:34",
    equipment: "덤벨",
    id: 7,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.11.14 06:58:34",
    weight: "60",
    workout: "체스트프레스",
  },
  {
    condition: ["화남", "피곤함", "좋음"],
    content: "Asdasdasd",
    createdAt: "2024.11.14 06:58:34",
    equipment: "덤벨",
    id: 6,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.11.14 06:58:34",
    weight: "60",
    workout: "체스트프레스",
  },
  {
    condition: [],
    content: "",
    createdAt: "2023.12.14 06:31:35",
    equipment: "덤벨",
    id: 5,
    setWithCount: [],
    title: "",
    type: "shoulder",
    updatedAt: "2024.12.14 06:31:35",
    weight: "60",
    workout: "비하인드넥프레스",
  },
  {
    condition: ["좋음", "피곤함", "화남", "슬픔"],
    content: "화이팅!!!",
    createdAt: "2023.11.10 03:42:17",
    equipment: "바벨",
    id: 4,
    setWithCount: [],
    title: "",
    type: "leg",
    updatedAt: "2024.11.08 03:42:17",
    weight: "100",
    workout: "레그프레스",
  },
  {
    condition: ["좋음", "피곤함", "화남", "아픔"],
    content: "열심히 운동합시다 화이팅!!!",
    createdAt: "2023.11.10 03:41:38",
    equipment: "스미스",
    id: 3,
    setWithCount: [],
    title: "오늘도 열심히",
    type: "shoulder",
    updatedAt: "2024.11.08 03:41:38",
    weight: "80",
    workout: "오버헤드프레스",
  },
  {
    condition: ["좋음", "피곤함", "화남", "아픔"],
    content: "",
    createdAt: "2023.10.08 03:40:49",
    equipment: "덤벨",
    id: 2,
    setWithCount: [],
    title: "",
    type: "chest",
    updatedAt: "2024.10.08 03:40:49",
    weight: "70",
    workout: "클로즈그립프레스",
  },
  {
    condition: [],
    content: "",
    createdAt: "2023.10.07 03:40:35",
    equipment: "바벨",
    id: 1,
    setWithCount: [],
    title: "",
    type: "back",
    updatedAt: "2024.11.08 03:40:35",
    weight: "60",
    workout: "데드리프트",
  },
]

export const mediaJSON = [
  {
    description:
      "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the rabbit ain't no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge.\n\nLicensed under the Creative Commons Attribution license\nhttp://www.bigbuckbunny.org",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ],
    subtitle: "By Blender Foundation",
    thumb: "images/BigBuckBunny.jpg",
    title: "Big Buck Bunny",
  },
  {
    description: "The first Blender Open Movie from 2006",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    ],
    subtitle: "By Blender Foundation",
    thumb: "images/ElephantsDream.jpg",
    title: "Elephant Dream",
  },
  {
    description:
      "HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV. For when you want to settle into your Iron Throne to watch the latest episodes. For $35.\nLearn how to use Chromecast with HBO GO and more at google.com/chromecast.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    ],
    subtitle: "By Google",
    thumb: "images/ForBiggerBlazes.jpg",
    title: "For Bigger Blazes",
  },
  {
    description:
      "Introducing Chromecast. The easiest way to enjoy online video and music on your TV—for when Batman's escapes aren't quite big enough. For $35. Learn how to use Chromecast with Google Play Movies and more at google.com/chromecast.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    ],
    subtitle: "By Google",
    thumb: "images/ForBiggerEscapes.jpg",
    title: "For Bigger Escape",
  },
  {
    description:
      "Introducing Chromecast. The easiest way to enjoy online video and music on your TV. For $35.  Find out more at google.com/chromecast.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    ],
    subtitle: "By Google",
    thumb: "images/ForBiggerFun.jpg",
    title: "For Bigger Fun",
  },
  {
    description:
      "Introducing Chromecast. The easiest way to enjoy online video and music on your TV—for the times that call for bigger joyrides. For $35. Learn how to use Chromecast with YouTube and more at google.com/chromecast.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    ],
    subtitle: "By Google",
    thumb: "images/ForBiggerJoyrides.jpg",
    title: "For Bigger Joyrides",
  },
  {
    description:
      "Introducing Chromecast. The easiest way to enjoy online video and music on your TV—for when you want to make Buster's big meltdowns even bigger. For $35. Learn how to use Chromecast with Netflix and more at google.com/chromecast.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    ],
    subtitle: "By Google",
    thumb: "images/ForBiggerMeltdowns.jpg",
    title: "For Bigger Meltdowns",
  },
  {
    description:
      "Sintel is an independently produced short film, initiated by the Blender Foundation as a means to further improve and validate the free/open source 3D creation suite Blender. With initial funding provided by 1000s of donations via the internet community, it has again proven to be a viable development model for both open 3D technology as for independent animation film.\nThis 15 minute film has been realized in the studio of the Amsterdam Blender Institute, by an international team of artists and developers. In addition to that, several crucial technical and creative targets have been realized online, by developers and artists and teams all over the world.\nwww.sintel.org",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    ],
    subtitle: "By Blender Foundation",
    thumb: "images/Sintel.jpg",
    title: "Sintel",
  },
  {
    description:
      "Smoking Tire takes the all-new Subaru Outback to the highest point we can find in hopes our customer-appreciation Balloon Launch will get some free T-shirts into the hands of our viewers.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    ],
    subtitle: "By Garage419",
    thumb: "images/SubaruOutbackOnStreetAndDirt.jpg",
    title: "Subaru Outback On Street And Dirt",
  },
  {
    description:
      "Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender. Target was to improve and test a complete open and free pipeline for visual effects in film - and to make a compelling sci-fi film in Amsterdam, the Netherlands.  The film itself, and all raw material used for making it, have been released under the Creatieve Commons 3.0 Attribution license. Visit the tearsofsteel.org website to find out more about this, or to purchase the 4-DVD box with a lot of extras.  (CC) Blender Foundation - http://www.tearsofsteel.org",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    ],
    subtitle: "By Blender Foundation",
    thumb: "images/TearsOfSteel.jpg",
    title: "Tears of Steel",
  },
  {
    description:
      "The Smoking Tire heads out to Adams Motorsports Park in Riverside, CA to test the most requested car of 2010, the Volkswagen GTI. Will it beat the Mazdaspeed3's standard-setting lap time? Watch and see...",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    ],
    subtitle: "By Garage419",
    thumb: "images/VolkswagenGTIReview.jpg",
    title: "Volkswagen GTI Review",
  },
  {
    description:
      "The Smoking Tire is going on the 2010 Bullrun Live Rally in a 2011 Shelby GT500, and posting a video from the road every single day! The only place to watch them is by subscribing to The Smoking Tire or watching at BlackMagicShine.com",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    ],
    subtitle: "By Garage419",
    thumb: "images/WeAreGoingOnBullrun.jpg",
    title: "We Are Going On Bullrun",
  },
  {
    description:
      "The Smoking Tire meets up with Chris and Jorge from CarsForAGrand.com to see just how far $1,000 can go when looking for a car.The Smoking Tire meets up with Chris and Jorge from CarsForAGrand.com to see just how far $1,000 can go when looking for a car.",
    sources: [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    ],
    subtitle: "By Garage419",
    thumb: "images/WhatCarCanYouGetForAGrand.jpg",
    title: "What care can you get for a grand?",
  },
]
