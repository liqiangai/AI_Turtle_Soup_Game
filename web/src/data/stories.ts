/**
 * 海龟汤故事数据（本地示例）
 * - 用于前端在未接入后端/AI前，先跑通大厅列表与对局流程
 * - 字段与难度分级对齐 PRD：easy / medium / hard
 */

export type TStoryDifficulty = "easy" | "medium" | "hard";

export type TStory = {
  id: string;
  title: string;
  difficulty: TStoryDifficulty;
  surface: string;
  bottom: string;
};

export const stories: TStory[] = [
  {
    id: "s_001_umbrella",
    title: "伞下的落汤鸡",
    difficulty: "easy",
    surface: "男人一路打着伞回家，却浑身湿透。为什么？",
    bottom:
      "他打的伞不是雨伞，而是“遮阳伞”（或广告伞）——伞面破洞/太小，挡不住雨。他一路都在打伞，所以看起来矛盾，但实际上根本没挡住雨。",
  },
  {
    id: "s_002_elevator",
    title: "空电梯里的推搡",
    difficulty: "medium",
    surface:
      "监控显示电梯里只有他一个人。电梯门打开时，他却踉跄着摔倒在地，嘴里喊着“别推我！”",
    bottom:
      "电梯里确实没有“人”，但有一只大型行李箱/推车。电梯启动和刹停时，箱子滑动撞到他，他误以为有人推他（或他正和电话里的人争吵，情绪失控，下意识喊出“别推我”）。监控只按“人形”识别，所以显示只有他一个人。",
  },
  {
    id: "s_003_empty_box",
    title: "空包裹的报警",
    difficulty: "medium",
    surface: "她收到一个空包裹后立刻报警，说“东西被偷了”。快递员却一脸无辜。为什么？",
    bottom:
      "她买的是“数字商品/兑换码/会员激活码”，商家约定只寄一张空卡片（或只寄包装）作为凭证，真正的内容在站内信/邮件里。她没找到兑换信息，以为包裹被偷而报警；快递员当然无辜。",
  },
  {
    id: "s_004_salt_coffee",
    title: "加盐的咖啡",
    difficulty: "hard",
    surface:
      "他在咖啡里倒了很多盐，喝了一口后却笑着对店员说：“谢谢，这次终于对了。”",
    bottom:
      "他曾经味觉受损/在康复训练中，医生让他用“咸/甜/苦”的强刺激测试味觉是否恢复。他一直尝不出味道，今天第一次能明显尝到“咸”，所以确认恢复了。店员以为他在挑咖啡口味，其实他是在确认自己的味觉。",
  },
  {
    id: "s_005_museum_alarm",
    title: "被奖励的报警",
    difficulty: "hard",
    surface:
      "博物馆半夜警报大作，保安立刻冲过去。第二天馆长却表扬并奖励了他，说他“救了镇馆之宝”。可事实上那晚什么都没丢。为什么？",
    bottom:
      "保安发现警报并不是盗窃触发，而是恒温恒湿系统异常导致展柜内湿度飙升。镇馆之宝是易受潮的文物，若不立即处理会不可逆损坏。他及时排查并启动应急方案（断电/启用备用除湿/转移文物），所以虽然没发生盗窃，但确实避免了重大损失。",
  },
];

