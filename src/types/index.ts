// 用户角色
export type UserRole = 'reviewer' | 'admin';

// 审核员在线状态
export type ReviewerStatus = 'online' | 'offline';

// 内容审核状态
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// 内容来源
export type ContentSource = 'normal' | 'reported';

// 举报类型
export type ReportType = 'copyright' | 'inappropriate';

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

// 审核内容
export interface Content {
  id: string;
  title: string;
  text: string;
  images: string[];
  publisher: Publisher;
  source: ContentSource;
  reportInfo?: ReportInfo;
  status: ContentStatus;
  assignedTo?: string; // 分配给哪个审核员
  assignedAt?: string;
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
export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'copyright', label: '侵权' },
  { value: 'inappropriate', label: '内容不合规' },
];
