import { OOTDRecord } from "./types";

export const INITIAL_OOTD_RECORDS: OOTDRecord[] = [
  {
    id: "record-1",
    date: "2026-06-18",
    imageBase64: "gradient-casual", // Visual identifier for our beautiful vector UI drawer
    items: {
      top: { type: "T恤", color: "牛仔白色", detail: "宽松圆领极简短袖" },
      bottom: { type: "牛仔裤", color: "浅蓝", detail: "水洗阔腿直筒" },
      hair: { style: "微卷披肩发", color: "冷茶棕色" },
      accessories: [
        { type: "腋下包", color: "奶茶棕", detail: "复古半月型皮革" },
        { type: "项链", color: "银色", detail: "极简细双环锁骨链" }
      ],
      shoes: { type: "运动鞋", color: "米白色", detail: "复古德训款式拼色" }
    },
    scenes: ["休闲", "逛街", "下午茶"],
    weather: { condition: "晴", temp: 28 },
    mood: "😊",
    createdAt: "2026-06-18T14:45:00.000Z",
    stylingAdvice: "经典的蓝白搭配充满夏日松弛感，奶茶色复古皮具与温和的棕色发型上下呼应，是绝对不会出错的舒适休闲穿搭。",
    trendOptimization: {
      trendVibe: "Clean Fit 极简海滩风",
      trendScore: 89,
      colorAdvice: "当前穿搭属蓝白温润基底。可尝试加入一抹今年爆火的亮珊瑚橘或柠檬黄作为肩飘小围巾/披肩，以此打破单一单调，塑造高能社交撞色。",
      shoeAdvice: "德训鞋绝对舒适。如要突显社交网感，也可以升级为金属感银色跑鞋或黑白条纹复古板鞋（如 Samba 系列）。",
      accAdvice: "建议增设一件哑光奶油米色的棒球帽，或是佩戴金属细框复古太阳镜，瞬间提升街拍漫步的松弛感度。",
      hashtags: ["#Cleanfit", "#夏日松弛感穿搭", "#每日穿搭", "#松弛感神仙单品"]
    }
  },
  {
    id: "record-2",
    date: "2026-06-19",
    imageBase64: "gradient-romance",
    items: {
      top: { type: "衬衫", color: "杏粉色", detail: "法式复古荷叶边泡泡袖" },
      bottom: { type: "半身裙", color: "经典黑", detail: "高腰中长款伞裙" },
      hair: { style: "法式温婉低马尾", color: "经典黑" },
      accessories: [
        { type: "手提包", color: "复古深红", detail: "漆皮亮面小方包" },
        { type: "耳环", color: "金色", detail: "巴洛克珍珠吊坠" }
      ],
      shoes: { type: "玛丽珍鞋", color: "漆皮黑", detail: "一字带粗跟复古" }
    },
    scenes: ["约会", "晚宴", "聚会"],
    weather: { condition: "阴", temp: 24 },
    mood: "🥰",
    createdAt: "2026-06-19T18:30:00.000Z",
    stylingAdvice: "杏粉法式荷叶边衬衫搭配稳重的赫本风黑金伞裙。红漆皮小包与鞋底呼应，完美衬托优雅妩媚的约会氛围。",
    trendOptimization: {
      trendVibe: "Balletcore 芭蕾少女风",
      trendScore: 94,
      colorAdvice: "粉与深茶/黑是绝妙的小红书撞色。建议选一件勃艮第酒红或樱桃色的蝴蝶结缎带丝带发夹，将法式油画少女感推到极致。",
      shoeAdvice: "黑色一字带玛丽珍鞋极佳。推荐搭配半透镂空白色中单袜或小腿提花袜，这正是今年最受瞩目的 Balletcore 点睛穿法。",
      accAdvice: "巴洛克异形珍珠耳环调性十足。可在颈间叠戴一条细款软皮复古颈链 Choker 或是锁骨单颗流光彩钻，吸睛度拉满。",
      hashtags: ["#芭蕾少女风", "#Balletcore", "#复古少女心", "#小红书穿搭灵感"]
    }
  },
  {
    id: "record-3",
    date: "2026-06-20",
    imageBase64: "gradient-office",
    items: {
      top: { type: "西装外套", color: "燕麦色", detail: "极简直筒修身半夹克" },
      bottom: { type: "西装裤", color: "奶白色", detail: "高腰高垂坠阔腿拉长" },
      hair: { style: "极简高马尾", color: "焦糖黑棕" },
      accessories: [
        { type: "托特包", color: "极简黑", detail: "大容量皮托特包" },
        { type: "腕表", color: "玫瑰金", detail: "极简金属细表带设计" }
      ],
      shoes: { type: "单鞋", color: "燕麦白", detail: "优雅尖头牛皮平底" }
    },
    scenes: ["通勤", "会议", "正式场合"],
    weather: { condition: "多云", temp: 22 },
    mood: "✨",
    createdAt: "2026-06-20T09:15:00.000Z",
    stylingAdvice: "顺色搭配在视觉上极具延伸感。燕麦色配奶白高腰西装裤，极简高级。大托特包和马尾发型干练有朝气。",
    trendOptimization: {
      trendVibe: "Office Siren 高智感白领风",
      trendScore: 91,
      colorAdvice: "极简高色级顺色非常显贵，可点缀一条深巧克力棕色调的纤细真丝窄领巾或焦糖皮革窄腰带，极具低调智美效果。",
      shoeAdvice: "平底尖头鞋成熟干练。当下亦非常流行换搭一双麂皮软皮浅底乐福鞋，更显老钱风(Old Money)的随性阔绰感。",
      accAdvice: "托特包和大金表质感在线。可再加戴一副无框或半黑框平光猫眼眼镜，完美契合近期社交媒体上最具话题度的‘高智感书卷气’。",
      hashtags: ["#高智感穿搭", "#OfficeSiren", "#老钱风通勤", "#日常西装穿搭指南"]
    }
  }
];
