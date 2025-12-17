'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Eye,
  User,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ReviewRecord, REJECT_REASONS } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function ReviewHistoryPage() {
  const { reviewRecords, reviewers, updateContent } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'approved' | 'rejected'>('all');
  const [filterReviewer, setFilterReviewer] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<ReviewRecord | null>(null);
  const [showReReviewModal, setShowReReviewModal] = useState(false);
  const [recordToReReview, setRecordToReReview] = useState<ReviewRecord | null>(null);

  // 搜索和筛选
  const filteredRecords = useMemo(() => {
    return reviewRecords
      .filter((record) => {
        // 搜索
        const matchesSearch = 
          record.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.content.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 审核结果筛选
        const matchesAction = filterAction === 'all' || record.action === filterAction;
        
        // 审核员筛选
        const matchesReviewer = filterReviewer === 'all' || record.reviewerId === filterReviewer;
        
        return matchesSearch && matchesAction && matchesReviewer;
      })
      .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
  }, [reviewRecords, searchTerm, filterAction, filterReviewer]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: reviewRecords.length,
      approved: reviewRecords.filter((r) => r.action === 'approved').length,
      rejected: reviewRecords.filter((r) => r.action === 'rejected').length,
    };
  }, [reviewRecords]);

  const getRejectReasonLabel = (reason: string) => {
    return REJECT_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  // 处理重审
  const handleReReview = (record: ReviewRecord) => {
    setRecordToReReview(record);
    setShowReReviewModal(true);
  };

  // 确认重审
  const confirmReReview = () => {
    if (!recordToReReview) return;

    // 将帖子状态改回pending，重新进入审核流程
    updateContent(recordToReReview.contentId, {
      status: 'pending',
    });

    toast.success('已提交重审，帖子将重新进入审核流程');
    setShowReReviewModal(false);
    setRecordToReReview(null);
  };

  return (
    <div className="min-h-screen">
      <Header title="审核记录" subtitle={`共 ${stats.total} 条审核记录`} />

      <div className="p-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilterAction('all')}
            className={`p-4 rounded-xl border transition-colors ${
              filterAction === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-70">全部</p>
          </button>
          <button
            onClick={() => setFilterAction('approved')}
            className={`p-4 rounded-xl border transition-colors ${
              filterAction === 'approved' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-sm opacity-70">已通过</p>
          </button>
          <button
            onClick={() => setFilterAction('rejected')}
            className={`p-4 rounded-xl border transition-colors ${
              filterAction === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200 hover:border-red-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.rejected}</p>
            <p className="text-sm opacity-70">已拒绝</p>
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
                placeholder="搜索帖子标题、内容或审核员..."
                className="input pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              
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

        {/* 审核记录列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              暂无审核记录
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 缩略图 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {record.content.images[0] ? (
                        <Image
                          src={record.content.images[0]}
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
                            {record.content.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {record.content.text}
                          </p>
                        </div>
                        <span
                          className={`badge flex-shrink-0 ${
                            record.action === 'approved' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {record.action === 'approved' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />已通过</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" />已拒绝</>
                          )}
                        </span>
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {record.reviewerName}
                        </span>
                        {record.rejectReason && (
                          <span>拒绝原因: {getRejectReasonLabel(record.rejectReason)}</span>
                        )}
                        <span>审核于 {formatRelativeTime(record.reviewedAt)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReReview(record)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 border border-blue-200 hover:border-blue-300"
                        title="重审"
                      >
                        <RotateCcw className="w-4 h-4" />
                        重审
                      </button>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="查看详情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 显示筛选结果数量 */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          共 {filteredRecords.length} 条审核记录
        </div>
      </div>

      {/* 详情弹窗 */}
      <Modal
        isOpen={!!selectedRecord}
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">审核时间</span>
                <span className="text-gray-700">{formatDate(selectedRecord.reviewedAt)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleReReview(selectedRecord)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重审
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 重审确认弹窗 */}
      <Modal
        isOpen={showReReviewModal}
        onClose={() => {
          setShowReReviewModal(false);
          setRecordToReReview(null);
        }}
        title="确认重审"
        size="sm"
      >
        <div className="p-6">
          {recordToReReview && (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <RotateCcw className="w-4 h-4" />
                  确认将此帖子提交重审？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{recordToReReview.content.title}</p>
                  <p className="text-gray-600 line-clamp-2">{recordToReReview.content.text}</p>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>当前状态：{recordToReReview.action === 'approved' ? '已通过' : '已拒绝'}</p>
                  <p>重审后，帖子将重新进入审核流程</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReReviewModal(false);
                    setRecordToReReview(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={confirmReReview} className="flex-1 btn-primary">
                  确认重审
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

