// 用户角色
export type UserRole = 'reviewer' | 'admin';

// 审核员在线状态
export type ReviewerStatus = 'online' | 'offline';

// 内容审核状态
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// 内容来源
export type ContentSource = 'normal' | 'reported';

// 举报类型
export type ReportType = 'harm' | 'rights';

// 拒绝原因类型
export type RejectReason = 
  | 'pornographic' 
  | 'violent' 
  | 'illegal' 
  | 'spam' 
  | 'copyright' 
  | 'false_info' 
  | 'other';

// 用户
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// 审核员
export interface Reviewer extends User {
  role: 'reviewer';
  status: ReviewerStatus;
  queueCapacity: number; // 队列容量
  currentQueueCount: number; // 当前队列数量
}

// 内容发布者信息（脱敏）
export interface Publisher {
  id: string;
  nickname: string; // 部分脱敏
  registerDays: number;
  postCount: number;
}

// 附件类型
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image';
  size?: number; // 文件大小（字节）
}

// 审核内容
export interface Content {
  id: string;
  title: string;
  text: string;
  images: string[];
  attachments?: Attachment[]; // 附件列表（PDF和图片）
  publisher: Publisher;
  source: ContentSource;
  reportInfo?: ReportInfo;
  status: ContentStatus;
  assignedTo?: string; // 分配给哪个审核员
  assignedAt?: string;
  createdAt: string;
  // 影子封禁和互动数据
  isShadowBanned?: boolean; // 是否影子封禁（不会出现在首页和搜索结果中）
  isSticky?: boolean; // 是否置顶
  likeCount?: number; // 点赞量
  favoriteCount?: number; // 收藏量
  comments?: Comment[]; // 评论列表
}

// 评论
export interface Comment {
  id: string;
  content: string;
  userId: string;
  nickname: string;
  createdAt: string;
}

// 举报信息
export interface ReportInfo {
  reportType: ReportType;
  reporterId: string;
  reportReason: string;
  reportedAt: string;
}

// 审核记录
export interface ReviewRecord {
  id: string;
  contentId: string;
  content: Content;
  reviewerId: string;
  reviewerName: string;
  action: 'approved' | 'rejected';
  rejectReason?: RejectReason;
  rejectNote?: string;
  reviewedAt: string;
  isOverturned: boolean; // 是否被复核推翻
  overturnedBy?: string;
  overturnedAt?: string;
  overturnNote?: string;
}

// 审核统计
export interface ReviewerStats {
  reviewerId: string;
  reviewerName: string;
  totalReviewed: number;
  approvedCount: number;
  rejectedCount: number;
  overturnedCount: number;
  reportedContentCount: number;
}

// 系统统计
export interface SystemStats {
  totalPending: number;
  totalReviewed: number;
  totalApproved: number;
  totalRejected: number;
  totalReported: number;
  onlineReviewers: number;
}

// 审核标准文档
export interface ReviewStandard {
  id: string;
  title: string;
  content: string;
  category: 'allowed' | 'prohibited' | 'reject_reasons' | 'copyright';
  updatedAt: string;
  updatedBy: string;
}

// 拒绝原因选项
export const REJECT_REASONS: { value: RejectReason; label: string }[] = [
  { value: 'pornographic', label: '色情低俗' },
  { value: 'violent', label: '暴力血腥' },
  { value: 'illegal', label: '违法违规' },
  { value: 'spam', label: '垃圾广告' },
  { value: 'copyright', label: '侵权内容' },
  { value: 'false_info', label: '虚假信息' },
  { value: 'other', label: '其他原因' },
];

// 举报类型选项
export const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { 
    value: 'harm', 
    label: '对他人造成困扰或危害', 
    description: '含有违法违规，色情低俗、涉嫌诈骗、违规营销及其他可能导致他人困扰或危害的内容' 
  },
  { 
    value: 'rights', 
    label: '侵犯我/我的组织的权益', 
    description: '含有中伤名誉、泄漏肖像及隐私、抄袭搬运、假冒商标或专利、冒充身份等对我造成侵权的内容' 
  },
];

// 黑白名单类型
export type BlacklistWhitelistType = 'blacklist' | 'whitelist';

// 黑白名单项
export interface BlacklistWhitelistItem {
  userId: string;
  type: BlacklistWhitelistType;
  addedAt: string;
  addedBy: string;
  note?: string;
}
