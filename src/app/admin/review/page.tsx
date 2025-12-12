'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Flag,
  Clock,
  User,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ReviewRecord, Content, REJECT_REASONS } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDate, formatRelativeTime } from '@/lib/utils';

// 统一的列表项类型
type QueueItem = {
  id: string;
  type: 'pending' | 'under_review' | 'reviewed';
  content: Content;
  record?: ReviewRecord;
  reviewer?: { id: string; name: string };
};

export default function ReviewQueue() {
  const { currentUser, reviewRecords, reviewers, contents, updateReviewRecord, updateContent } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterReviewer, setFilterReviewer] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<ReviewRecord | null>(null);
  const [showOverturnModal, setShowOverturnModal] = useState(false);
  const [overturnNote, setOverturnNote] = useState('');

  // 构建统一的队列列表
  const queueItems = useMemo(() => {
    const items: QueueItem[] = [];

    // 1. 未分配的内容
    contents
      .filter((c) => c.status === 'pending' && !c.assignedTo)
      .forEach((content) => {
        items.push({
          id: `pending-${content.id}`,
          type: 'pending',
          content,
        });
      });

    // 2. 审核中的内容
    contents
      .filter((c) => c.status === 'under_review' && c.assignedTo)
      .forEach((content) => {
        const reviewer = reviewers.find((r) => r.id === content.assignedTo);
        items.push({
          id: `review-${content.id}`,
          type: 'under_review',
          content,
          reviewer: reviewer ? { id: reviewer.id, name: reviewer.name } : undefined,
        });
      });

    // 3. 已审核的内容
    reviewRecords.forEach((record) => {
      items.push({
        id: `done-${record.id}`,
        type: 'reviewed',
        content: record.content,
        record,
        reviewer: { id: record.reviewerId, name: record.reviewerName },
      });
    });

    return items;
  }, [contents, reviewRecords, reviewers]);

  // 筛选后的列表
  const filteredItems = useMemo(() => {
    return queueItems
      .filter((item) => {
        // 状态筛选
        if (filterStatus !== 'all') {
          if (filterStatus === 'pending' && item.type !== 'pending') return false;
          if (filterStatus === 'under_review' && item.type !== 'under_review') return false;
          if (filterStatus === 'approved' && !(item.type === 'reviewed' && item.record?.action === 'approved')) return false;
          if (filterStatus === 'rejected' && !(item.type === 'reviewed' && item.record?.action === 'rejected')) return false;
          if (filterStatus === 'overturned' && !(item.type === 'reviewed' && item.record?.isOverturned)) return false;
        }

        // 来源筛选
        if (filterSource !== 'all') {
          if (filterSource === 'reported' && item.content.source !== 'reported') return false;
          if (filterSource === 'normal' && item.content.source !== 'normal') return false;
        }

        // 审核员筛选
        if (filterReviewer !== 'all') {
          if (!item.reviewer || item.reviewer.id !== filterReviewer) return false;
        }

        // 搜索
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchTitle = item.content.title.toLowerCase().includes(term);
          const matchText = item.content.text.toLowerCase().includes(term);
          if (!matchTitle && !matchText) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 排序：未分配 > 审核中 > 已审核（按时间倒序）
        const typeOrder = { pending: 0, under_review: 1, reviewed: 2 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        // 同类型按时间排序
        const timeA = a.record?.reviewedAt || a.content.createdAt;
        const timeB = b.record?.reviewedAt || b.content.createdAt;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
  }, [queueItems, filterStatus, filterSource, filterReviewer, searchTerm]);

  // 统计数据
  const stats = useMemo(() => ({
    total: queueItems.length,
    pending: queueItems.filter((i) => i.type === 'pending').length,
    underReview: queueItems.filter((i) => i.type === 'under_review').length,
    approved: queueItems.filter((i) => i.type === 'reviewed' && i.record?.action === 'approved').length,
    rejected: queueItems.filter((i) => i.type === 'reviewed' && i.record?.action === 'rejected').length,
    overturned: queueItems.filter((i) => i.record?.isOverturned).length,
  }), [queueItems]);

  const getRejectReasonLabel = (reason: string) => {
    return REJECT_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  // 推翻审核结果
  const handleOverturn = () => {
    if (!selectedRecord || !currentUser) return;

    updateReviewRecord(selectedRecord.id, {
      isOverturned: true,
      overturnedBy: currentUser.id,
      overturnedAt: new Date().toISOString(),
      overturnNote: overturnNote || undefined,
    });

    const newStatus = selectedRecord.action === 'approved' ? 'rejected' : 'approved';
    updateContent(selectedRecord.contentId, { status: newStatus });

    toast.success('审核结果已推翻');
    setShowOverturnModal(false);
    setOverturnNote('');
    setSelectedRecord(null);
  };

  // 恢复审核结果
  const handleRestore = (record: ReviewRecord) => {
    updateReviewRecord(record.id, {
      isOverturned: false,
      overturnedBy: undefined,
      overturnedAt: undefined,
      overturnNote: undefined,
    });
    updateContent(record.contentId, { status: record.action });
    toast.success('已恢复原审核结果');
  };

  // 获取状态标签
  const getStatusBadge = (item: QueueItem) => {
    if (item.type === 'pending') {
      return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />未分配</span>;
    }
    if (item.type === 'under_review') {
      return <span className="badge badge-info"><Eye className="w-3 h-3 mr-1" />审核中</span>;
    }
    if (item.record?.isOverturned) {
      return <span className="badge badge-warning"><AlertTriangle className="w-3 h-3 mr-1" />已推翻</span>;
    }
    if (item.record?.action === 'approved') {
      return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />已通过</span>;
    }
    return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" />已拒绝</span>;
  };

  return (
    <div className="min-h-screen">
      <Header title="审核队列" subtitle="查看和管理所有内容审核状态" />

      <div className="p-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-70">全部</p>
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'pending' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 hover:border-orange-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm opacity-70">未分配</p>
          </button>
          <button
            onClick={() => setFilterStatus('under_review')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'under_review' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.underReview}</p>
            <p className="text-sm opacity-70">审核中</p>
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'approved' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-sm opacity-70">已通过</p>
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200 hover:border-red-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.rejected}</p>
            <p className="text-sm opacity-70">已拒绝</p>
          </button>
          <button
            onClick={() => setFilterStatus('overturned')}
            className={`p-4 rounded-xl border transition-colors ${
              filterStatus === 'overturned' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.overturned}</p>
            <p className="text-sm opacity-70">已推翻</p>
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索内容标题或文字..."
                className="input pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="input w-auto"
              >
                <option value="all">全部来源</option>
                <option value="normal">普通发布</option>
                <option value="reported">举报内容</option>
              </select>

              <select
                value={filterReviewer}
                onChange={(e) => setFilterReviewer(e.target.value)}
                className="input w-auto"
              >
                <option value="all">全部审核员</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 内容列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              暂无符合条件的内容
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    item.record?.isOverturned ? 'bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* 缩略图 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.content.images[0] ? (
                        <Image
                          src={item.content.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          无图片
                        </div>
                      )}
                    </div>

                    {/* 内容信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-800 truncate">
                            {item.content.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {item.content.text}
                          </p>
                        </div>
                        {getStatusBadge(item)}
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {item.content.source === 'reported' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            举报内容
                          </span>
                        )}
                        {item.reviewer && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.reviewer.name}
                          </span>
                        )}
                        {item.record?.reviewedAt && (
                          <span>审核于 {formatRelativeTime(item.record.reviewedAt)}</span>
                        )}
                        {item.record?.rejectReason && (
                          <span>原因: {getRejectReasonLabel(item.record.rejectReason)}</span>
                        )}
                      </div>

                      {item.record?.isOverturned && item.record.overturnNote && (
                        <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded inline-block">
                          推翻说明: {item.record.overturnNote}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    {item.type === 'reviewed' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedRecord(item.record!)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="查看详情"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {item.record?.isOverturned ? (
                          <button
                            onClick={() => handleRestore(item.record!)}
                            className="px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            恢复
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRecord(item.record!);
                              setShowOverturnModal(true);
                            }}
                            className="px-3 py-1.5 text-sm text-[#ff2442] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            推翻
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 显示筛选结果数量 */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          共 {filteredItems.length} 条记录
        </div>
      </div>

      {/* 详情弹窗 */}
      <Modal
        isOpen={!!selectedRecord && !showOverturnModal}
        onClose={() => setSelectedRecord(null)}
        title="审核详情"
        size="lg"
      >
        {selectedRecord && (
          <div className="p-6">
            {/* 图片 */}
            {selectedRecord.content.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedRecord.content.images.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 内容 */}
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {selectedRecord.content.title}
            </h3>
            <p className="text-gray-600 mb-4">{selectedRecord.content.text}</p>

            {/* 审核信息 */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">审核员</span>
                <span className="text-gray-700">{selectedRecord.reviewerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">审核结果</span>
                <span
                  className={`badge ${
                    selectedRecord.action === 'approved' ? 'badge-success' : 'badge-danger'
                  }`}
                >
                  {selectedRecord.action === 'approved' ? '通过' : '拒绝'}
                </span>
              </div>
              {selectedRecord.rejectReason && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">拒绝原因</span>
                  <span className="text-gray-700">
                    {getRejectReasonLabel(selectedRecord.rejectReason)}
                  </span>
                </div>
              )}
              {selectedRecord.rejectNote && (
                <div className="text-sm">
                  <span className="text-gray-500">补充说明：</span>
                  <p className="text-gray-700 mt-1">{selectedRecord.rejectNote}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">审核时间</span>
                <span className="text-gray-700">{formatDate(selectedRecord.reviewedAt)}</span>
              </div>

              {selectedRecord.isOverturned && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    审核结果已被推翻
                  </div>
                  {selectedRecord.overturnNote && (
                    <p className="text-sm text-gray-700">
                      推翻说明：{selectedRecord.overturnNote}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    推翻时间：{formatDate(selectedRecord.overturnedAt!)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 btn-secondary"
              >
                关闭
              </button>
              {!selectedRecord.isOverturned && (
                <button
                  onClick={() => setShowOverturnModal(true)}
                  className="flex-1 btn-danger"
                >
                  推翻此结果
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 推翻确认弹窗 */}
      <Modal
        isOpen={showOverturnModal}
        onClose={() => {
          setShowOverturnModal(false);
          setOverturnNote('');
        }}
        title="推翻审核结果"
        size="sm"
      >
        <div className="p-6">
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg mb-4">
            <p className="text-sm text-yellow-700">
              推翻后，内容状态将从「
              {selectedRecord?.action === 'approved' ? '通过' : '拒绝'}」变为「
              {selectedRecord?.action === 'approved' ? '拒绝' : '通过'}」
            </p>
          </div>

          <div className="mb-4">
            <label className="label">推翻说明</label>
            <textarea
              value={overturnNote}
              onChange={(e) => setOverturnNote(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="请输入推翻原因..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowOverturnModal(false);
                setOverturnNote('');
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleOverturn} className="flex-1 btn-danger">
              确认推翻
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
