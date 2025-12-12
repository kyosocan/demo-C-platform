'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Reviewer, Content, ReviewRecord, ReviewStandard, ReviewerStats, SystemStats } from '@/types';
import { mockUsers, mockReviewers, mockContents, mockReviewRecords, mockReviewStandards } from './mock-data';

interface AppState {
  // 当前用户
  currentUser: User | Reviewer | null;
  setCurrentUser: (user: User | Reviewer | null) => void;
  
  // 用户列表
  users: User[];
  reviewers: Reviewer[];
  
  // 内容列表
  contents: Content[];
  addContent: (content: Content) => void;
  updateContent: (id: string, updates: Partial<Content>) => void;
  
  // 审核记录
  reviewRecords: ReviewRecord[];
  addReviewRecord: (record: ReviewRecord) => void;
  updateReviewRecord: (id: string, updates: Partial<ReviewRecord>) => void;
  
  // 审核标准
  reviewStandards: ReviewStandard[];
  updateReviewStandard: (id: string, updates: Partial<ReviewStandard>) => void;
  
  // 审核员操作
  updateReviewerStatus: (id: string, status: 'online' | 'offline') => void;
  updateReviewerCapacity: (id: string, capacity: number) => void;
  updateReviewerQueueCount: (id: string, count: number) => void;
  
  // 任务分发
  assignTaskToReviewer: (contentId: string, reviewerId: string) => void;
  unassignTask: (contentId: string) => void;
  
  // 获取审核员的任务队列
  getReviewerQueue: (reviewerId: string) => Content[];
  
  // 获取待审核内容（未分配的）
  getPendingContents: () => Content[];
  
  // 获取审核员统计
  getReviewerStats: (reviewerId: string) => ReviewerStats;
  
  // 获取系统统计
  getSystemStats: () => SystemStats;
  
  // 登录
  login: (username: string, password: string) => User | Reviewer | null;
  logout: () => void;
  
  // 添加审核员
  addReviewer: (reviewer: Reviewer) => void;
  deleteReviewer: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      reviewers: mockReviewers,
      contents: mockContents,
      reviewRecords: mockReviewRecords,
      reviewStandards: mockReviewStandards,
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addContent: (content) => set((state) => ({
        contents: [...state.contents, content],
      })),
      
      updateContent: (id, updates) => set((state) => ({
        contents: state.contents.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      addReviewRecord: (record) => set((state) => ({
        reviewRecords: [...state.reviewRecords, record],
      })),
      
      updateReviewRecord: (id, updates) => set((state) => ({
        reviewRecords: state.reviewRecords.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      })),
      
      updateReviewStandard: (id, updates) => set((state) => ({
        reviewStandards: state.reviewStandards.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),
      
      updateReviewerStatus: (id, status) => set((state) => ({
        reviewers: state.reviewers.map((r) =>
          r.id === id ? { ...r, status, currentQueueCount: status === 'offline' ? 0 : r.currentQueueCount } : r
        ),
        currentUser: state.currentUser?.id === id 
          ? { ...state.currentUser, status, currentQueueCount: status === 'offline' ? 0 : (state.currentUser as Reviewer).currentQueueCount } as Reviewer
          : state.currentUser,
      })),
      
      updateReviewerCapacity: (id, capacity) => set((state) => ({
        reviewers: state.reviewers.map((r) =>
          r.id === id ? { ...r, queueCapacity: capacity } : r
        ),
        currentUser: state.currentUser?.id === id 
          ? { ...state.currentUser, queueCapacity: capacity } as Reviewer
          : state.currentUser,
      })),
      
      updateReviewerQueueCount: (id, count) => set((state) => ({
        reviewers: state.reviewers.map((r) =>
          r.id === id ? { ...r, currentQueueCount: count } : r
        ),
        currentUser: state.currentUser?.id === id 
          ? { ...state.currentUser, currentQueueCount: count } as Reviewer
          : state.currentUser,
      })),
      
      assignTaskToReviewer: (contentId, reviewerId) => set((state) => {
        const reviewer = state.reviewers.find((r) => r.id === reviewerId);
        if (!reviewer || reviewer.status === 'offline' || reviewer.currentQueueCount >= reviewer.queueCapacity) {
          return state;
        }
        
        return {
          contents: state.contents.map((c) =>
            c.id === contentId
              ? { ...c, assignedTo: reviewerId, assignedAt: new Date().toISOString(), status: 'under_review' as const }
              : c
          ),
          reviewers: state.reviewers.map((r) =>
            r.id === reviewerId
              ? { ...r, currentQueueCount: r.currentQueueCount + 1 }
              : r
          ),
          currentUser: state.currentUser?.id === reviewerId
            ? { ...state.currentUser, currentQueueCount: (state.currentUser as Reviewer).currentQueueCount + 1 } as Reviewer
            : state.currentUser,
        };
      }),
      
      unassignTask: (contentId) => set((state) => {
        const content = state.contents.find((c) => c.id === contentId);
        if (!content || !content.assignedTo) return state;
        
        const reviewerId = content.assignedTo;
        
        return {
          contents: state.contents.map((c) =>
            c.id === contentId
              ? { ...c, assignedTo: undefined, assignedAt: undefined, status: 'pending' as const }
              : c
          ),
          reviewers: state.reviewers.map((r) =>
            r.id === reviewerId
              ? { ...r, currentQueueCount: Math.max(0, r.currentQueueCount - 1) }
              : r
          ),
          currentUser: state.currentUser?.id === reviewerId
            ? { ...state.currentUser, currentQueueCount: Math.max(0, (state.currentUser as Reviewer).currentQueueCount - 1) } as Reviewer
            : state.currentUser,
        };
      }),
      
      getReviewerQueue: (reviewerId) => {
        const state = get();
        return state.contents.filter(
          (c) => c.assignedTo === reviewerId && c.status === 'under_review'
        );
      },
      
      getPendingContents: () => {
        const state = get();
        return state.contents.filter(
          (c) => c.status === 'pending' && !c.assignedTo
        );
      },
      
      getReviewerStats: (reviewerId) => {
        const state = get();
        const reviewer = state.reviewers.find((r) => r.id === reviewerId);
        const records = state.reviewRecords.filter((r) => r.reviewerId === reviewerId);
        
        return {
          reviewerId,
          reviewerName: reviewer?.name || '',
          totalReviewed: records.length,
          approvedCount: records.filter((r) => r.action === 'approved').length,
          rejectedCount: records.filter((r) => r.action === 'rejected').length,
          overturnedCount: records.filter((r) => r.isOverturned).length,
          reportedContentCount: records.filter((r) => r.content.source === 'reported').length,
        };
      },
      
      getSystemStats: () => {
        const state = get();
        return {
          totalPending: state.contents.filter((c) => c.status === 'pending' || c.status === 'under_review').length,
          totalReviewed: state.reviewRecords.length,
          totalApproved: state.reviewRecords.filter((r) => r.action === 'approved' && !r.isOverturned).length,
          totalRejected: state.reviewRecords.filter((r) => r.action === 'rejected' && !r.isOverturned).length,
          totalReported: state.contents.filter((c) => c.source === 'reported').length,
          onlineReviewers: state.reviewers.filter((r) => r.status === 'online').length,
        };
      },
      
      login: (username, password) => {
        const state = get();
        
        // 检查管理员
        const admin = state.users.find(
          (u) => u.username === username && u.password === password
        );
        if (admin) {
          set({ currentUser: admin });
          return admin;
        }
        
        // 检查审核员
        const reviewer = state.reviewers.find(
          (r) => r.username === username && r.password === password
        );
        if (reviewer) {
          set({ currentUser: reviewer });
          return reviewer;
        }
        
        return null;
      },
      
      logout: () => set({ currentUser: null }),
      
      addReviewer: (reviewer) => set((state) => ({
        reviewers: [...state.reviewers, reviewer],
      })),
      
      deleteReviewer: (id) => set((state) => ({
        reviewers: state.reviewers.filter((r) => r.id !== id),
      })),
    }),
    {
      name: 'content-review-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        reviewers: state.reviewers,
        contents: state.contents,
        reviewRecords: state.reviewRecords,
        reviewStandards: state.reviewStandards,
      }),
    }
  )
);
