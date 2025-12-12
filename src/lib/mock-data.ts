import { User, Reviewer, Content, ReviewRecord, ReviewStandard } from '@/types';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    name: '张管理',
    role: 'admin',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// 模拟审核员数据
export const mockReviewers: Reviewer[] = [
  {
    id: 'reviewer-1',
    username: 'reviewer1',
    password: '123456',
    name: '李审核',
    role: 'reviewer',
    status: 'online',
    queueCapacity: 10,
    currentQueueCount: 3,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'reviewer-2',
    username: 'reviewer2',
    password: '123456',
    name: '王小明',
    role: 'reviewer',
    status: 'online',
    queueCapacity: 8,
    currentQueueCount: 5,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'reviewer-3',
    username: 'reviewer3',
    password: '123456',
    name: '赵晓华',
    role: 'reviewer',
    status: 'offline',
    queueCapacity: 15,
    currentQueueCount: 0,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'reviewer-4',
    username: 'reviewer4',
    password: '123456',
    name: '钱小红',
    role: 'reviewer',
    status: 'online',
    queueCapacity: 12,
    currentQueueCount: 8,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

// 模拟内容数据
export const mockContents: Content[] = [
  {
    id: 'content-1',
    title: '今日OOTD｜春日穿搭分享',
    text: '今天天气超好，分享一下我的春日穿搭～白色针织开衫搭配高腰牛仔裤，再配上一双小白鞋，简单又好看！姐妹们觉得怎么样？',
    images: [
      'https://picsum.photos/400/600?random=1',
      'https://picsum.photos/400/600?random=2',
    ],
    publisher: {
      id: 'user-101',
      nickname: '小*花',
      registerDays: 180,
      postCount: 45,
    },
    source: 'normal',
    status: 'pending',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'content-2',
    title: '减脂餐食谱大公开！一周瘦5斤',
    text: '分享我的减脂餐食谱，每天热量控制在1200卡以内，一周下来瘦了5斤！早餐：全麦面包+鸡蛋+牛奶；午餐：鸡胸肉沙拉；晚餐：清蒸鱼+蔬菜...',
    images: [
      'https://picsum.photos/400/600?random=3',
      'https://picsum.photos/400/600?random=4',
      'https://picsum.photos/400/600?random=5',
    ],
    publisher: {
      id: 'user-102',
      nickname: '健**达人',
      registerDays: 365,
      postCount: 120,
    },
    source: 'normal',
    status: 'pending',
    createdAt: '2024-03-15T11:00:00Z',
  },
  {
    id: 'content-3',
    title: '⚠️独家爆料：某明星私生活曝光',
    text: '今天给大家带来一个大瓜！某一线明星的私生活照片流出...',
    images: [
      'https://picsum.photos/400/600?random=6',
    ],
    publisher: {
      id: 'user-103',
      nickname: '娱**料',
      registerDays: 30,
      postCount: 15,
    },
    source: 'reported',
    reportInfo: {
      reportType: 'inappropriate',
      reporterId: 'user-200',
      reportReason: '涉嫌传播隐私信息，未经证实的谣言',
      reportedAt: '2024-03-15T12:00:00Z',
    },
    status: 'pending',
    createdAt: '2024-03-15T09:00:00Z',
  },
  {
    id: 'content-4',
    title: '好物推荐｜这款面霜真的绝了！',
    text: '用了一个月的真实感受！这款面霜保湿效果超级好，而且不油腻，非常适合混油皮的姐妹们～',
    images: [
      'https://picsum.photos/400/600?random=7',
      'https://picsum.photos/400/600?random=8',
    ],
    publisher: {
      id: 'user-104',
      nickname: '美**主',
      registerDays: 500,
      postCount: 200,
    },
    source: 'normal',
    status: 'pending',
    createdAt: '2024-03-15T13:30:00Z',
  },
  {
    id: 'content-5',
    title: '转卖全新XX品牌包包，低价出',
    text: '因为买重了，全新带吊牌的XX品牌包包低价转让，原价3999现在只要1999！',
    images: [
      'https://picsum.photos/400/600?random=9',
    ],
    publisher: {
      id: 'user-105',
      nickname: '二**易',
      registerDays: 60,
      postCount: 8,
    },
    source: 'reported',
    reportInfo: {
      reportType: 'copyright',
      reporterId: 'user-201',
      reportReason: '疑似售卖假货，图片盗用他人',
      reportedAt: '2024-03-15T14:00:00Z',
    },
    status: 'pending',
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'content-6',
    title: '旅行vlog｜云南7天6晚深度游',
    text: '终于去了心心念念的云南！这次的行程是大理-丽江-香格里拉，每一站都美到窒息。分享一下我的行程攻略和拍照打卡点～',
    images: [
      'https://picsum.photos/400/600?random=10',
      'https://picsum.photos/400/600?random=11',
      'https://picsum.photos/400/600?random=12',
      'https://picsum.photos/400/600?random=13',
    ],
    publisher: {
      id: 'user-106',
      nickname: '旅**记',
      registerDays: 730,
      postCount: 89,
    },
    source: 'normal',
    status: 'pending',
    createdAt: '2024-03-15T15:00:00Z',
  },
  {
    id: 'content-7',
    title: '家居改造｜10平米小房间变身ins风',
    text: '租房党也能拥有美美的房间！分享我的改造过程，预算不到1000块，效果却惊艳了～',
    images: [
      'https://picsum.photos/400/600?random=14',
      'https://picsum.photos/400/600?random=15',
    ],
    publisher: {
      id: 'user-107',
      nickname: '家**达人',
      registerDays: 200,
      postCount: 35,
    },
    source: 'normal',
    status: 'pending',
    createdAt: '2024-03-15T16:00:00Z',
  },
  {
    id: 'content-8',
    title: '这个减肥药一周瘦20斤！！！',
    text: '姐妹们！我发现了一个神奇的减肥药，不用节食不用运动，一周就能瘦20斤！私信我链接～',
    images: [
      'https://picsum.photos/400/600?random=16',
    ],
    publisher: {
      id: 'user-108',
      nickname: '瘦*达人',
      registerDays: 7,
      postCount: 3,
    },
    source: 'reported',
    reportInfo: {
      reportType: 'inappropriate',
      reporterId: 'user-202',
      reportReason: '虚假广告，疑似诈骗',
      reportedAt: '2024-03-15T17:00:00Z',
    },
    status: 'pending',
    createdAt: '2024-03-15T16:30:00Z',
  },
];

// 模拟审核记录
export const mockReviewRecords: ReviewRecord[] = [
  {
    id: 'record-1',
    contentId: 'content-old-1',
    content: {
      id: 'content-old-1',
      title: '美食探店｜这家火锅太好吃了',
      text: '周末和闺蜜去吃的火锅，环境超好，味道也很正宗！推荐鸳鸯锅底～',
      images: ['https://picsum.photos/400/600?random=20'],
      publisher: {
        id: 'user-201',
        nickname: '美**客',
        registerDays: 100,
        postCount: 25,
      },
      source: 'normal',
      status: 'approved',
      createdAt: '2024-03-14T10:00:00Z',
    },
    reviewerId: 'reviewer-1',
    reviewerName: '李审核',
    action: 'approved',
    reviewedAt: '2024-03-14T10:30:00Z',
    isOverturned: false,
  },
  {
    id: 'record-2',
    contentId: 'content-old-2',
    content: {
      id: 'content-old-2',
      title: '免费领取iPhone15！！',
      text: '点击链接就能免费领取最新款iPhone15，数量有限先到先得！',
      images: ['https://picsum.photos/400/600?random=21'],
      publisher: {
        id: 'user-202',
        nickname: '送**利',
        registerDays: 3,
        postCount: 1,
      },
      source: 'reported',
      reportInfo: {
        reportType: 'inappropriate',
        reporterId: 'user-300',
        reportReason: '诈骗信息',
        reportedAt: '2024-03-14T11:00:00Z',
      },
      status: 'rejected',
      createdAt: '2024-03-14T09:00:00Z',
    },
    reviewerId: 'reviewer-1',
    reviewerName: '李审核',
    action: 'rejected',
    rejectReason: 'spam',
    rejectNote: '明显的诈骗广告信息',
    reviewedAt: '2024-03-14T11:30:00Z',
    isOverturned: false,
  },
  {
    id: 'record-3',
    contentId: 'content-old-3',
    content: {
      id: 'content-old-3',
      title: '护肤心得｜敏感肌的福音',
      text: '作为敏感肌，终于找到了适合自己的护肤品组合...',
      images: ['https://picsum.photos/400/600?random=22'],
      publisher: {
        id: 'user-203',
        nickname: '护**达人',
        registerDays: 400,
        postCount: 60,
      },
      source: 'normal',
      status: 'approved',
      createdAt: '2024-03-14T12:00:00Z',
    },
    reviewerId: 'reviewer-2',
    reviewerName: '王小明',
    action: 'approved',
    reviewedAt: '2024-03-14T12:30:00Z',
    isOverturned: false,
  },
  {
    id: 'record-4',
    contentId: 'content-old-4',
    content: {
      id: 'content-old-4',
      title: '学习分享｜考研经验贴',
      text: '今年成功上岸！分享一下我的考研经验和复习资料...',
      images: ['https://picsum.photos/400/600?random=23'],
      publisher: {
        id: 'user-204',
        nickname: '学**姐',
        registerDays: 600,
        postCount: 80,
      },
      source: 'normal',
      status: 'rejected',
      createdAt: '2024-03-14T13:00:00Z',
    },
    reviewerId: 'reviewer-2',
    reviewerName: '王小明',
    action: 'rejected',
    rejectReason: 'copyright',
    rejectNote: '疑似抄袭他人笔记内容',
    reviewedAt: '2024-03-14T13:30:00Z',
    isOverturned: true,
    overturnedBy: 'admin-1',
    overturnedAt: '2024-03-14T15:00:00Z',
    overturnNote: '经核实为原创内容，恢复通过',
  },
];

// 模拟审核标准
export const mockReviewStandards: ReviewStandard[] = [
  {
    id: 'standard-1',
    title: '允许发布的内容类型',
    category: 'allowed',
    content: `## 允许发布的内容

### 1. 生活分享类
- 日常穿搭、美妆护肤心得
- 美食探店、菜谱分享
- 旅行攻略、游记
- 家居装修、收纳整理
- 健身运动、减脂餐食谱

### 2. 知识分享类
- 学习经验、考试攻略
- 职场技能、工作心得
- 理财知识、生活技巧
- 书籍/电影/音乐推荐

### 3. 好物推荐类
- 真实使用体验分享
- 产品对比测评
- 购物攻略

### 4. 其他
- 情感分享（不涉及负面引导）
- 宠物日常
- 手工DIY
- 摄影作品`,
    updatedAt: '2024-03-01T00:00:00Z',
    updatedBy: 'admin-1',
  },
  {
    id: 'standard-2',
    title: '禁止发布的内容类型',
    category: 'prohibited',
    content: `## 禁止发布的内容

### 1. 色情低俗 🚫
- 暴露、性暗示内容
- 软色情擦边内容
- 低俗玩梗、恶俗表演

### 2. 暴力血腥 🚫
- 血腥恐怖画面
- 暴力行为展示
- 危险动作模仿

### 3. 违法违规 🚫
- 涉及毒品、赌博
- 违禁品买卖
- 教唆违法行为

### 4. 垃圾广告 🚫
- 虚假宣传
- 诈骗信息
- 恶意引流
- 刷单/代购广告

### 5. 侵权内容 🚫
- 盗用他人图片/视频
- 抄袭他人原创内容
- 侵犯他人隐私

### 6. 虚假信息 🚫
- 未经证实的谣言
- 虚假新闻
- 伪科学内容
- 夸大效果的宣传`,
    updatedAt: '2024-03-01T00:00:00Z',
    updatedBy: 'admin-1',
  },
  {
    id: 'standard-3',
    title: '拒绝理由说明',
    category: 'reject_reasons',
    content: `## 拒绝理由使用说明

| 拒绝理由 | 适用场景 | 示例 |
|---------|---------|------|
| 色情低俗 | 暴露、性暗示、软色情内容 | 过度暴露的穿搭、暧昧姿势 |
| 暴力血腥 | 血腥画面、暴力行为 | 打架视频、恐怖图片 |
| 违法违规 | 涉及违法内容 | 售卖违禁品、教唆犯罪 |
| 垃圾广告 | 虚假广告、诈骗引流 | "免费领取"、"点击链接" |
| 侵权内容 | 盗图、抄袭、侵犯隐私 | 未授权使用他人照片 |
| 虚假信息 | 谣言、伪科学 | "一周瘦20斤"的虚假宣传 |
| 其他原因 | 以上都不适用时 | 需要在备注中详细说明 |

### 注意事项
1. 选择最主要的违规原因
2. 如有多个违规，可在备注中补充说明
3. 使用"其他原因"时必须填写详细说明`,
    updatedAt: '2024-03-01T00:00:00Z',
    updatedBy: 'admin-1',
  },
  {
    id: 'standard-4',
    title: '侵权判断指南',
    category: 'copyright',
    content: `## 侵权判断指南

### 1. 图片侵权
**判断要点：**
- 图片是否带有其他平台/用户水印
- 图片风格与发布者历史内容是否一致
- 是否为网络热图/明星照片

**处理方式：**
- 明显盗图 → 直接拒绝
- 存疑 → 标记后提交复核

### 2. 内容抄袭
**判断要点：**
- 文案是否过于通用/模板化
- 是否与平台已有内容高度相似
- 排版风格是否异常（如从其他平台复制）

**处理方式：**
- 明显抄袭 → 拒绝并注明来源（如知道）
- 存疑 → 可通过，但标记观察

### 3. 隐私侵犯
**判断要点：**
- 是否未经同意展示他人正脸/隐私信息
- 是否曝光他人住址、电话等
- 是否为偷拍内容

**处理方式：**
- 涉及隐私 → 必须拒绝
- 如涉及公众人物 → 需要复核`,
    updatedAt: '2024-03-01T00:00:00Z',
    updatedBy: 'admin-1',
  },
];
