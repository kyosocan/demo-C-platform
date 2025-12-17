'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText,
  Settings,
  Flag,
  Power,
  File,
  Download,
  Shield
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
    updateReviewerStatus,
    getPendingContents,
    updateContent,
    addReviewRecord,
    addToBlacklistWhitelist,
    isInBlacklist,
  } = useAppStore();

  const reviewer = currentUser as Reviewer;
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectReason>('other');
  const [imageIndex, setImageIndex] = useState(0);
  const [blacklistNote, setBlacklistNote] = useState('');

  // 获取下一个待审核内容
  const getNextContent = useCallback(() => {
    const pendingContents = getPendingContents();
    setPendingCount(pendingContents.length);
    
    if (pendingContents.length > 0) {
      setCurrentContent(pendingContents[0]);
      setImageIndex(0);
    } else {
      setCurrentContent(null);
    }
  }, [getPendingContents]);

  // 初始化加载和状态变化时重新加载
  useEffect(() => {
    if (reviewer && reviewer.status === 'online') {
      getNextContent();
    } else if (reviewer && reviewer.status === 'offline') {
      setCurrentContent(null);
    }
  }, [reviewer?.status, reviewer, getNextContent]);

  // 定期刷新
  useEffect(() => {
    if (reviewer && reviewer.status === 'online') {
      const interval = setInterval(() => {
        getNextContent();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [reviewer?.status, reviewer, getNextContent]);

  // 处理通过
  const handleApprove = () => {
    if (!currentContent || !reviewer) return;

    // 更新内容状态
    updateContent(currentContent.id, { 
      status: 'approved',
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
    
    // 获取下一个
    setTimeout(() => {
      getNextContent();
    }, 300);
  };

  // 处理拒绝
  const handleReject = () => {
    if (!currentContent || !reviewer) return;

    // 更新内容状态
    updateContent(currentContent.id, { 
      status: 'rejected',
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
      reviewedAt: new Date().toISOString(),
      isOverturned: false,
    });

    toast.success('已拒绝');
    setShowRejectModal(false);
    setRejectReason('other');
    
    // 获取下一个
    setTimeout(() => {
      getNextContent();
    }, 300);
  };

  // 切换在线状态
  const toggleStatus = () => {
    if (reviewer) {
      const newStatus = reviewer.status === 'online' ? 'offline' : 'online';
      updateReviewerStatus(reviewer.id, newStatus);
      if (newStatus === 'online') {
        // 延迟一下确保状态更新完成后再获取内容
        setTimeout(() => {
          getNextContent();
        }, 100);
      } else {
        setCurrentContent(null);
      }
      toast.info(newStatus === 'online' ? '已上线' : '已下线');
    }
  };

  if (!reviewer) return null;

  return (
    <div className="min-h-screen">
      <Header 
        title="审核工作台" 
        subtitle={`帖子池中还有 ${pendingCount} 条待审核`} 
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
              待审核: <span className="font-medium text-gray-800">{pendingCount} 条</span>
            </div>
          </div>
          <button
            onClick={toggleStatus}
            className={`btn flex items-center gap-2 ${
              reviewer.status === 'online' ? 'btn-secondary' : 'btn-primary'
            }`}
          >
            <Power className="w-4 h-4" />
            {reviewer.status === 'online' ? '下线' : '上线'}
          </button>
        </div>

        {/* 审核区域 */}
        {reviewer.status === 'offline' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">您已离线</h3>
            <p className="text-gray-500 mb-4">
              请点击"上线"按钮开始审核工作
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
                      用户ID: <span className="font-mono text-gray-700">{currentContent.publisher.id}</span>
                    </p>
                    {isInBlacklist(currentContent.publisher.id) && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        已在黑名单
                      </p>
                    )}
                  </div>
                  {!isInBlacklist(currentContent.publisher.id) && (
                    <button
                      onClick={() => {
                        setShowBlacklistModal(true);
                        setBlacklistNote('');
                      }}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-red-200 hover:border-red-300"
                      title="拉黑用户"
                    >
                      <Shield className="w-4 h-4" />
                      拉黑
                    </button>
                  )}
                </div>

                {/* 举报信息 */}
                {currentContent.reportInfo && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      举报类型：{currentContent.reportInfo.reportType === 'copyright' ? '侵权' : '内容不合规'}
                    </div>
                  </div>
                )}

                {/* 附件列表 */}
                {currentContent.attachments && currentContent.attachments.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <File className="w-4 h-4" />
                      附件 ({currentContent.attachments.length})
                    </div>
                    <div className="space-y-2">
                      {currentContent.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            attachment.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {attachment.type === 'pdf' ? (
                              <File className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {attachment.name}
                            </p>
                            {attachment.size && (
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="查看/下载"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 操作面板 */}
            <div className="space-y-6">
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
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无待审核内容</h3>
            <p className="text-gray-500">
              帖子池中暂时没有待审核的内容
            </p>
          </div>
        )}
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

      {/* 拉黑确认弹窗 */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => {
          setShowBlacklistModal(false);
          setBlacklistNote('');
        }}
        title="确认拉黑用户"
        size="sm"
      >
        <div className="p-6">
          {currentContent && (
            <>
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                  <Shield className="w-4 h-4" />
                  确认将此用户加入黑名单？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">用户昵称：{currentContent.publisher.nickname}</p>
                  <p className="text-gray-600">
                    用户ID: <span className="font-mono">{currentContent.publisher.id}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="label">备注（可选）</label>
                <textarea
                  value={blacklistNote}
                  onChange={(e) => setBlacklistNote(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="请输入拉黑原因..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBlacklistModal(false);
                    setBlacklistNote('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (currentContent) {
                      addToBlacklistWhitelist(
                        currentContent.publisher.id,
                        'blacklist',
                        blacklistNote.trim() || undefined
                      );
                      toast.success('用户已加入黑名单');
                      setShowBlacklistModal(false);
                      setBlacklistNote('');
                    }
                  }}
                  className="flex-1 btn-danger"
                >
                  确认拉黑
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
