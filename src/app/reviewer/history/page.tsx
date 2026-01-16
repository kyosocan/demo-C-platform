'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Reviewer, ReviewRecord, REJECT_REASONS, REPORT_TYPES } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function ReviewerHistory() {
  const { currentUser, reviewRecords } = useAppStore();
  const reviewer = currentUser as Reviewer;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'approved' | 'rejected'>('all');
  const [selectedRecord, setSelectedRecord] = useState<ReviewRecord | null>(null);

  // 过滤当前审核员的记录
  const myRecords = useMemo(() => {
    return reviewRecords
      .filter((record) => record.reviewerId === reviewer?.id)
      .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
  }, [reviewRecords, reviewer]);

  // 搜索和筛选
  const filteredRecords = useMemo(() => {
    return myRecords.filter((record) => {
      const matchesSearch = 
        record.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.content.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterAction === 'all' || record.action === filterAction;
      return matchesSearch && matchesFilter;
    });
  }, [myRecords, searchTerm, filterAction]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: myRecords.length,
      approved: myRecords.filter((r) => r.action === 'approved').length,
      rejected: myRecords.filter((r) => r.action === 'rejected').length,
      overturned: myRecords.filter((r) => r.isOverturned).length,
    };
  }, [myRecords]);

  const getRejectReasonLabel = (reason: string) => {
    return REJECT_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  return (
    <div className="min-h-screen">
      <Header title="审核记录" subtitle="查看您的历史审核记录" />

      <div className="p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-1">总审核数</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-1">通过</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-1">拒绝</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500 mb-1">被推翻</p>
            <p className="text-2xl font-bold text-orange-600">{stats.overturned}</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
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
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as typeof filterAction)}
                className="input w-auto"
              >
                <option value="all">全部</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">暂无审核记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
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
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {record.content.text}
                          </p>
                        </div>
                        
                        {/* 状态标签 */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span
                            className={`badge ${
                              record.action === 'approved' ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {record.action === 'approved' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {record.action === 'approved' ? '已通过' : '已拒绝'}
                          </span>
                          
                          {record.isOverturned && (
                            <span className="badge badge-warning">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              已被推翻
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>审核时间: {formatRelativeTime(record.reviewedAt)}</span>
                        {record.rejectReason && (
                          <span>拒绝原因: {getRejectReasonLabel(record.rejectReason)}</span>
                        )}
                        {record.content.source === 'reported' && (
                          <span className="text-red-500">来自举报</span>
                        )}
                      </div>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

            {/* 评论展示 */}
            {selectedRecord.content.comments && selectedRecord.content.comments.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                  <MessageSquare className="w-4 h-4" />
                  评论 ({selectedRecord.content.comments.length})
                </div>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {selectedRecord.content.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-800">{comment.nickname}</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 审核结果 */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
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

              {selectedRecord.content.source === 'reported' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    {REPORT_TYPES.find(t => t.value === selectedRecord.content.reportInfo?.reportType)?.label || '举报信息'}
                  </div>
                  <div className="text-sm text-gray-500 mb-3 ml-6">
                    {REPORT_TYPES.find(t => t.value === selectedRecord.content.reportInfo?.reportType)?.description}
                  </div>
                  {selectedRecord.content.reportInfo && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 ml-6 relative">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">举报描述：</div>
                        <div className="text-sm text-gray-700">{selectedRecord.content.reportInfo.reportReason}</div>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 复核信息 */}
              {selectedRecord.isOverturned && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 font-medium mb-2">
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
          </div>
        )}
      </Modal>
    </div>
  );
}
