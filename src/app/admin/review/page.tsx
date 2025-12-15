'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Flag,
  XCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Content } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatRelativeTime } from '@/lib/utils';

export default function ReviewQueue() {
  const { contents, updateContent } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showTakeDownModal, setShowTakeDownModal] = useState(false);
  const [showTakeUpModal, setShowTakeUpModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [takeDownReason, setTakeDownReason] = useState('');

  // 筛选后的列表（搜索所有帖子）
  const filteredItems = useMemo(() => {
    return contents
      .filter((content) => {
        // 搜索
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchTitle = content.title.toLowerCase().includes(term);
          const matchText = content.text.toLowerCase().includes(term);
          if (!matchTitle && !matchText) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 按时间倒序排序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [contents, searchTerm]);

  // 获取状态标签
  const getStatusBadge = (content: Content) => {
    if (content.status === 'pending') {
      return <span className="badge badge-warning">待审核</span>;
    }
    if (content.status === 'rejected') {
      return <span className="badge badge-danger">已下架</span>;
    }
    if (content.status === 'approved') {
      return <span className="badge badge-success">已上架</span>;
    }
    return null;
  };

  // 处理下架
  const handleTakeDown = () => {
    if (!selectedContent) return;

    updateContent(selectedContent.id, {
      status: 'rejected',
    });

    toast.success('帖子已下架');
    setShowTakeDownModal(false);
    setSelectedContent(null);
    setTakeDownReason('');
  };

  // 处理上架
  const handleTakeUp = () => {
    if (!selectedContent) return;

    updateContent(selectedContent.id, {
      status: 'approved',
    });

    toast.success('帖子已上架');
    setShowTakeUpModal(false);
    setSelectedContent(null);
  };

  // 打开下架确认弹窗
  const openTakeDownModal = (content: Content) => {
    setSelectedContent(content);
    setShowTakeDownModal(true);
  };

  // 打开上架确认弹窗
  const openTakeUpModal = (content: Content) => {
    setSelectedContent(content);
    setShowTakeUpModal(true);
  };

  // 判断是否可以下架
  const canTakeDown = (content: Content) => {
    return content.status === 'pending' || content.status === 'approved';
  };

  // 判断是否可以上架
  const canTakeUp = (content: Content) => {
    return content.status === 'rejected';
  };

  return (
    <div className="min-h-screen">
      <Header title="搜索帖子" subtitle="搜索并管理帖子" />

      <div className="p-6">
        {/* 搜索栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索帖子标题或内容..."
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* 内容列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm ? '未找到匹配的帖子' : '暂无帖子'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((content) => (
                <div
                  key={content.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 缩略图 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {content.images[0] ? (
                        <Image
                          src={content.images[0]}
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
                            {content.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {content.text}
                          </p>
                        </div>
                        {getStatusBadge(content)}
                      </div>

                      {/* 元信息 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {content.source === 'reported' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            举报内容
                          </span>
                        )}
                        <span>发布于 {formatRelativeTime(content.createdAt)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canTakeDown(content) && (
                        <button
                          onClick={() => openTakeDownModal(content)}
                          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-red-200 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                          下架
                        </button>
                      )}
                      {canTakeUp(content) && (
                        <button
                          onClick={() => openTakeUpModal(content)}
                          className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2 border border-green-200 hover:border-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                          上架
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 显示搜索结果数量 */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          共找到 {filteredItems.length} 条帖子
        </div>
      </div>

      {/* 上架确认弹窗 */}
      <Modal
        isOpen={showTakeUpModal}
        onClose={() => {
          setShowTakeUpModal(false);
          setSelectedContent(null);
        }}
        title="确认上架帖子"
        size="sm"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  确认上架此帖子？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{selectedContent.title}</p>
                  <p className="text-gray-600 line-clamp-2">{selectedContent.text}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTakeUpModal(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleTakeUp} className="flex-1 btn-primary">
                  确认上架
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 下架确认弹窗 */}
      <Modal
        isOpen={showTakeDownModal}
        onClose={() => {
          setShowTakeDownModal(false);
          setSelectedContent(null);
          setTakeDownReason('');
        }}
        title="确认下架帖子"
        size="sm"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  确认下架此帖子？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{selectedContent.title}</p>
                  <p className="text-gray-600 line-clamp-2">{selectedContent.text}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="label">下架原因（可选）</label>
                <textarea
                  value={takeDownReason}
                  onChange={(e) => setTakeDownReason(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="请输入下架原因..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTakeDownModal(false);
                    setSelectedContent(null);
                    setTakeDownReason('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleTakeDown} className="flex-1 btn-danger">
                  确认下架
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
