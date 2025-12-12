'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Flag
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Reviewer, Content, RejectReason, REJECT_REASONS } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatRelativeTime, generateId } from '@/lib/utils';

export default function ReviewerWorkstation() {
  const { 
    currentUser, 
    updateReviewerCapacity, 
    getReviewerQueue,
    getPendingContents,
    assignTaskToReviewer,
    updateContent,
    addReviewRecord,
    reviewers,
  } = useAppStore();

  const reviewer = currentUser as Reviewer;
  const [queue, setQueue] = useState<Content[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectReason>('other');
  const [rejectNote, setRejectNote] = useState('');
  const [capacity, setCapacity] = useState(reviewer?.queueCapacity || 10);
  const [imageIndex, setImageIndex] = useState(0);

  // 获取当前队列
  const refreshQueue = useCallback(() => {
    if (reviewer) {
      const currentQueue = getReviewerQueue(reviewer.id);
      setQueue(currentQueue);
    }
  }, [reviewer, getReviewerQueue]);

  // 自动分发任务
  const autoAssignTasks = useCallback(() => {
    if (!reviewer || reviewer.status === 'offline') return;

    const currentReviewer = reviewers.find(r => r.id === reviewer.id);
    if (!currentReviewer) return;

    const currentQueue = getReviewerQueue(reviewer.id);
    const availableSlots = currentReviewer.queueCapacity - currentQueue.length;
    
    if (availableSlots <= 0) return;

    const pendingContents = getPendingContents();
    const toAssign = pendingContents.slice(0, availableSlots);
    
    toAssign.forEach((content) => {
      assignTaskToReviewer(content.id, reviewer.id);
    });

    if (toAssign.length > 0) {
      toast.info(`已自动分配 ${toAssign.length} 条任务`);
    }
  }, [reviewer, reviewers, getReviewerQueue, getPendingContents, assignTaskToReviewer]);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // 定期检查并自动分发任务
  useEffect(() => {
    autoAssignTasks();
    const interval = setInterval(() => {
      refreshQueue();
      autoAssignTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoAssignTasks, refreshQueue]);

  const currentContent = queue[currentIndex];

  // 处理通过
  const handleApprove = () => {
    if (!currentContent || !reviewer) return;

    // 更新内容状态
    updateContent(currentContent.id, { 
      status: 'approved',
      assignedTo: undefined,
      assignedAt: undefined,
    });

    // 添加审核记录
    addReviewRecord({
      id: generateId('record-'),
      contentId: currentContent.id,
      content: { ...currentContent, status: 'approved' },
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      action: 'approved',
      reviewedAt: new Date().toISOString(),
      isOverturned: false,
    });

    toast.success('已通过');
    
    // 移动到下一条或刷新
    if (currentIndex >= queue.length - 1) {
      setCurrentIndex(0);
    }
    refreshQueue();
    setImageIndex(0);
  };

  // 处理拒绝
  const handleReject = () => {
    if (!currentContent || !reviewer) return;

    // 更新内容状态
    updateContent(currentContent.id, { 
      status: 'rejected',
      assignedTo: undefined,
      assignedAt: undefined,
    });

    // 添加审核记录
    addReviewRecord({
      id: generateId('record-'),
      contentId: currentContent.id,
      content: { ...currentContent, status: 'rejected' },
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      action: 'rejected',
      rejectReason,
      rejectNote: rejectNote || undefined,
      reviewedAt: new Date().toISOString(),
      isOverturned: false,
    });

    toast.success('已拒绝');
    setShowRejectModal(false);
    setRejectReason('other');
    setRejectNote('');
    
    // 移动到下一条或刷新
    if (currentIndex >= queue.length - 1) {
      setCurrentIndex(0);
    }
    refreshQueue();
    setImageIndex(0);
  };

  // 保存设置
  const handleSaveSettings = () => {
    if (reviewer) {
      updateReviewerCapacity(reviewer.id, capacity);
      toast.success('设置已保存');
      setShowSettingsModal(false);
    }
  };

  // 上一条/下一条
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageIndex(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageIndex(0);
    }
  };

  if (!reviewer) return null;

  return (
    <div className="min-h-screen">
      <Header 
        title="审核工作台" 
        subtitle={`队列: ${queue.length}/${reviewer.queueCapacity}`} 
      />

      <div className="p-6">
        {/* 状态栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${reviewer.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">{reviewer.status === 'online' ? '工作中' : '已离线'}</span>
            </div>
            <div className="text-gray-500">
              队列容量: <span className="font-medium text-gray-800">{queue.length}/{reviewer.queueCapacity}</span>
            </div>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
        </div>

        {/* 审核区域 */}
        {queue.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无待审核内容</h3>
            <p className="text-gray-500">
              {reviewer.status === 'online' 
                ? '系统会自动为您分配新的审核任务' 
                : '请先将状态设置为在线以接收任务'}
            </p>
          </div>
        ) : currentContent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 内容展示 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 图片区域 */}
              <div className="relative aspect-[3/4] bg-gray-100">
                {currentContent.images.length > 0 ? (
                  <>
                    <Image
                      src={currentContent.images[imageIndex]}
                      alt={currentContent.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {currentContent.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {currentContent.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === imageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">无图片</span>
                  </div>
                )}
                
                {/* 来源标记 */}
                {currentContent.source === 'reported' && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    <Flag className="w-4 h-4" />
                    来自举报
                  </div>
                )}
              </div>

              {/* 内容信息 */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">{currentContent.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{currentContent.text}</p>
                
                {/* 发布者信息 */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{currentContent.publisher.nickname}</p>
                    <p className="text-sm text-gray-500">
                      注册 {currentContent.publisher.registerDays} 天 · 发布 {currentContent.publisher.postCount} 篇
                    </p>
                  </div>
                </div>

                {/* 举报信息 */}
                {currentContent.reportInfo && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      举报信息
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">类型：</span>
                      {currentContent.reportInfo.reportType === 'copyright' ? '侵权' : '内容不合规'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">原因：</span>
                      {currentContent.reportInfo.reportReason}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      举报时间：{formatRelativeTime(currentContent.reportInfo.reportedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 操作面板 */}
            <div className="space-y-6">
              {/* 导航 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="btn-outline flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一条
                  </button>
                  <span className="text-gray-600">
                    {currentIndex + 1} / {queue.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex === queue.length - 1}
                    className="btn-outline flex items-center gap-1 disabled:opacity-50"
                  >
                    下一条
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 审核操作 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">审核操作</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6" />
                    通过
                  </button>
                  
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                    拒绝
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  快捷键：按 A 通过，按 R 拒绝
                </p>
              </div>

              {/* 内容元信息 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">内容信息</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">内容ID</span>
                    <span className="font-mono text-gray-700">{currentContent.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">发布时间</span>
                    <span className="text-gray-700">{formatRelativeTime(currentContent.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">图片数量</span>
                    <span className="text-gray-700">{currentContent.images.length} 张</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">来源</span>
                    <span className={`badge ${currentContent.source === 'reported' ? 'badge-danger' : 'badge-info'}`}>
                      {currentContent.source === 'reported' ? '举报' : '正常发布'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 拒绝理由弹窗 */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="选择拒绝理由"
      >
        <div className="p-6">
          <div className="space-y-3 mb-6">
            {REJECT_REASONS.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  rejectReason === reason.value
                    ? 'border-[#ff2442] bg-[#fff5f5]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="rejectReason"
                  value={reason.value}
                  checked={rejectReason === reason.value}
                  onChange={(e) => setRejectReason(e.target.value as RejectReason)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    rejectReason === reason.value
                      ? 'border-[#ff2442]'
                      : 'border-gray-300'
                  }`}
                >
                  {rejectReason === reason.value && (
                    <div className="w-3 h-3 rounded-full bg-[#ff2442]" />
                  )}
                </div>
                <span className="font-medium">{reason.label}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="label">补充说明（可选）</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="请输入补充说明..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleReject} className="flex-1 btn-danger">
              确认拒绝
            </button>
          </div>
        </div>
      </Modal>

      {/* 设置弹窗 */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="工作设置"
      >
        <div className="p-6">
          <div className="mb-6">
            <label className="label">队列容量</label>
            <p className="text-sm text-gray-500 mb-3">
              设置您一次可以接受的最大待审核数量
            </p>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={50}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">建议设置 5-20 条</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCapacity(reviewer.queueCapacity);
                setShowSettingsModal(false);
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveSettings} className="flex-1 btn-primary">
              保存设置
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
