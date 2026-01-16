'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Flag,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  File,
  Download,
  EyeOff,
  ThumbsUp,
  Star,
  ArrowUpCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Content, REPORT_TYPES, Comment } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatRelativeTime } from '@/lib/utils';

export default function ReviewQueue() {
  const { contents, updateContent, deleteComment } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showTakeDownModal, setShowTakeDownModal] = useState(false);
  const [showTakeUpModal, setShowTakeUpModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShadowBanModal, setShowShadowBanModal] = useState(false);
  const [showStickyModal, setShowStickyModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showShadowBannedOnly, setShowShadowBannedOnly] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [takeDownReason, setTakeDownReason] = useState('');
  const [likeCount, setLikeCount] = useState('');
  const [favoriteCount, setFavoriteCount] = useState('');

  // 筛选后的列表（搜索所有帖子）
  const filteredItems = useMemo(() => {
    // 如果没有搜索关键词，不显示任何帖子
    if (!searchTerm.trim()) {
      return [];
    }

    return contents
      .filter((content) => {
        // 搜索
        const term = searchTerm.toLowerCase();
        const matchTitle = content.title.toLowerCase().includes(term);
        const matchText = content.text.toLowerCase().includes(term);
        const matchesSearch = matchTitle || matchText;

        if (!matchesSearch) return false;

        // 影子封禁过滤逻辑：
        // 1. 如果开启了“仅显示影子封禁”，则只显示被影子封禁的
        // 2. 如果未开启，则显示全部（后台管理应可以看到所有帖子）
        if (showShadowBannedOnly) {
          return content.isShadowBanned === true;
        }
        
        return true;
      })
      .sort((a, b) => {
        // 如果有置顶，置顶的在前
        if (a.isSticky !== b.isSticky) {
          return a.isSticky ? -1 : 1;
        }
        // 按时间倒序排序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [contents, searchTerm, showShadowBannedOnly]);

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

  // 处理影子封禁
  const handleShadowBan = () => {
    if (!selectedContent) return;

    updateContent(selectedContent.id, {
      isShadowBanned: true,
    });

    toast.success('帖子已影子封禁');
    setShowShadowBanModal(false);
    setSelectedContent(null);
  };

  // 处理取消影子封禁
  const handleCancelShadowBan = (content: Content) => {
    updateContent(content.id, {
      isShadowBanned: false,
    });

    toast.success('已取消影子封禁');
    setSelectedContent(null);
  };

  // 处理设置置顶
  const handleSticky = () => {
    if (!selectedContent) return;

    updateContent(selectedContent.id, {
      isSticky: true,
    });

    toast.success('帖子已置顶');
    setShowStickyModal(false);
    setSelectedContent(null);
  };

  // 处理取消置顶
  const handleCancelSticky = (content: Content) => {
    updateContent(content.id, {
      isSticky: false,
    });

    toast.success('已取消帖子置顶');
  };

  // 处理增加点赞和收藏量
  const handleAddStats = () => {
    if (!selectedContent) return;

    const likeAdd = likeCount.trim() ? parseInt(likeCount) : 0;
    const favoriteAdd = favoriteCount.trim() ? parseInt(favoriteCount) : 0;

    if (isNaN(likeAdd) || likeAdd < 0) {
      toast.error('点赞量必须是大于等于0的数字');
      return;
    }

    if (isNaN(favoriteAdd) || favoriteAdd < 0) {
      toast.error('收藏量必须是大于等于0的数字');
      return;
    }

    const newLikeCount = (selectedContent.likeCount || 0) + likeAdd;
    const newFavoriteCount = (selectedContent.favoriteCount || 0) + favoriteAdd;

    updateContent(selectedContent.id, {
      likeCount: newLikeCount,
      favoriteCount: newFavoriteCount,
    });

    toast.success(`已增加点赞和收藏（当前：点赞 ${newLikeCount}，收藏 ${newFavoriteCount}）`);
    setShowStatsModal(false);
    setSelectedContent(null);
    setLikeCount('');
    setFavoriteCount('');
  };

  // 处理删除评论
  const handleDeleteComment = (contentId: string, commentId: string) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;
    
    deleteComment(contentId, commentId);
    
    // 更新当前选中的帖子状态，以便 UI 即时刷新
    if (selectedContent && selectedContent.id === contentId) {
      setSelectedContent({
        ...selectedContent,
        comments: selectedContent.comments?.filter(c => c.id !== commentId)
      });
    }
    
    toast.success('评论已删除');
  };

  // 打开影子封禁弹窗
  const openShadowBanModal = (content: Content) => {
    setSelectedContent(content);
    setShowShadowBanModal(true);
  };

  // 打开增加统计弹窗
  const openStatsModal = (content: Content) => {
    setSelectedContent(content);
    setLikeCount('');
    setFavoriteCount('');
    setShowStatsModal(true);
  };

  // 打开评论管理弹窗
  const openCommentModal = (content: Content) => {
    setSelectedContent(content);
    setShowCommentModal(true);
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
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="showShadowBanned"
                checked={showShadowBannedOnly}
                onChange={(e) => setShowShadowBannedOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="showShadowBanned" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                仅查看影子封禁
              </label>
            </div>
          </div>
        </div>

        {/* 内容列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm.trim() ? '未找到匹配的帖子' : '请输入关键词搜索帖子'}
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
                        {content.isSticky && (
                          <span className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            <ArrowUpCircle className="w-3 h-3" />
                            已置顶
                          </span>
                        )}
                        {content.source === 'reported' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            举报内容
                          </span>
                        )}
                        <span>发布于 {formatRelativeTime(content.createdAt)}</span>
                        {content.comments && content.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {content.comments.length} 条评论
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openStatsModal(content)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="增加点赞/收藏量"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openCommentModal(content)}
                        disabled={!content.comments || content.comments.length === 0}
                        className={`p-2 rounded-lg transition-colors ${
                          content.comments && content.comments.length > 0
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="删除评论"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {content.isSticky ? (
                        <button
                          onClick={() => handleCancelSticky(content)}
                          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 border border-blue-200 hover:border-blue-300"
                          title="已置顶，点击取消"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          已置顶
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedContent(content);
                            setShowStickyModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="置顶"
                        >
                          <ArrowUpCircle className="w-5 h-5" />
                        </button>
                      )}
                      {content.isShadowBanned ? (
                        <button
                          onClick={() => handleCancelShadowBan(content)}
                          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 border border-gray-200 hover:border-gray-300"
                          title="已影子封禁，点击取消"
                        >
                          <EyeOff className="w-4 h-4" />
                          已影封
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedContent(content);
                            setShowShadowBanModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="影子封禁"
                        >
                          <EyeOff className="w-5 h-5" />
                        </button>
                      )}
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
        {searchTerm.trim() && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            共找到 {filteredItems.length} 条帖子
          </div>
        )}
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

      {/* 评论管理弹窗 */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedContent(null);
        }}
        title="评论管理"
        size="md"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                帖子：{selectedContent.title}
              </div>
              {selectedContent.comments && selectedContent.comments.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {selectedContent.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            {comment.nickname}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(selectedContent.id, comment.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="删除评论"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  该帖子暂无评论
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedContent(null);
                  }}
                  className="btn-secondary w-full"
                >
                  关闭
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

      {/* 详情弹窗 */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedContent(null);
        }}
        title="帖子详情"
        size="lg"
      >
        {selectedContent && (
          <div className="p-6">
            {/* 图片 */}
            {selectedContent.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedContent.images.map((img, idx) => (
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
              {selectedContent.title}
            </h3>
            <p className="text-gray-600 mb-4">{selectedContent.text}</p>

            {/* 发布者信息 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {selectedContent.publisher.nickname.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{selectedContent.publisher.nickname}</p>
                <p className="text-sm text-gray-500">
                  用户ID: <span className="font-mono text-gray-700">{selectedContent.publisher.id}</span>
                </p>
              </div>
            </div>

            {/* 附件列表 */}
            {selectedContent.attachments && selectedContent.attachments.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                  <File className="w-4 h-4" />
                  附件 ({selectedContent.attachments.length})
                </div>
                <div className="space-y-2">
                  {selectedContent.attachments.map((attachment) => (
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
                          <File className="w-5 h-5" />
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

            {/* 评论列表 */}
            {selectedContent.comments && selectedContent.comments.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                  <MessageSquare className="w-4 h-4" />
                  评论 ({selectedContent.comments.length})
                </div>
                <div className="space-y-3">
                  {selectedContent.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{comment.nickname}</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(selectedContent.id, comment.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="删除评论"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 状态信息 */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">状态</span>
                {getStatusBadge(selectedContent)}
              </div>
              {selectedContent.isShadowBanned && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <EyeOff className="w-4 h-4" />
                  已影子封禁
                </div>
              )}
              {selectedContent.isSticky && (
                <div className="flex items-center gap-2 text-blue-600 text-sm font-bold">
                  <ArrowUpCircle className="w-4 h-4" />
                  已置顶
                </div>
              )}
              {(selectedContent.likeCount !== undefined || selectedContent.favoriteCount !== undefined) && (
                <div className="flex items-center gap-4 text-sm">
                  {selectedContent.likeCount !== undefined && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>点赞: {selectedContent.likeCount}</span>
                    </div>
                  )}
                  {selectedContent.favoriteCount !== undefined && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Star className="w-4 h-4" />
                      <span>收藏: {selectedContent.favoriteCount}</span>
                    </div>
                  )}
                </div>
              )}
              {selectedContent.source === 'reported' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    {REPORT_TYPES.find(t => t.value === selectedContent.reportInfo?.reportType)?.label || '举报信息'}
                  </div>
                  <div className="text-sm text-gray-500 mb-3 ml-6">
                    {REPORT_TYPES.find(t => t.value === selectedContent.reportInfo?.reportType)?.description}
                  </div>
                  {selectedContent.reportInfo && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 ml-6 relative">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">举报描述：</div>
                        <div className="text-sm text-gray-700">{selectedContent.reportInfo.reportReason}</div>
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">发布时间</span>
                <span className="text-gray-700">{formatRelativeTime(selectedContent.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedContent(null);
                }}
                className="flex-1 btn-secondary"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openStatsModal(selectedContent);
                }}
                className="flex-1 btn-outline flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                增加点赞/收藏
              </button>
              {selectedContent.isSticky ? (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleCancelSticky(selectedContent);
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 text-blue-600"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  取消置顶
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowStickyModal(true);
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 text-blue-600"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  置顶
                </button>
              )}
              {selectedContent.isShadowBanned ? (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleCancelShadowBan(selectedContent);
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 text-gray-600"
                >
                  <EyeOff className="w-4 h-4" />
                  取消影封
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowShadowBanModal(true);
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 text-gray-600"
                >
                  <EyeOff className="w-4 h-4" />
                  影子封禁
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 影子封禁确认弹窗 */}
      <Modal
        isOpen={showShadowBanModal}
        onClose={() => {
          setShowShadowBanModal(false);
          setSelectedContent(null);
        }}
        title="确认影子封禁帖子"
        size="sm"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <EyeOff className="w-4 h-4" />
                  确认影子封禁此帖子？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{selectedContent.title}</p>
                  <p className="text-gray-600 line-clamp-2">{selectedContent.text}</p>
                </div>
                <div className="mt-2 text-xs text-gray-500 italic">
                  影子封禁后，帖子将不会出现在首页和搜索结果中。
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowShadowBanModal(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleShadowBan} className="flex-1 btn-primary bg-gray-700 hover:bg-gray-800">
                  确认影子封禁
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 增加点赞/收藏量弹窗 */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => {
          setShowStatsModal(false);
          setSelectedContent(null);
          setLikeCount('');
          setFavoriteCount('');
        }}
        title="增加点赞量和收藏量"
        size="sm"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{selectedContent.title}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    增加点赞数
                  </label>
                  <input
                    type="number"
                    value={likeCount}
                    onChange={(e) => setLikeCount(e.target.value)}
                    className="input"
                    placeholder="输入要增加的数量"
                    min="0"
                  />
                  {selectedContent.likeCount !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前值: {selectedContent.likeCount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    增加收藏数
                  </label>
                  <input
                    type="number"
                    value={favoriteCount}
                    onChange={(e) => setFavoriteCount(e.target.value)}
                    className="input"
                    placeholder="输入要增加的数量"
                    min="0"
                  />
                  {selectedContent.favoriteCount !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前值: {selectedContent.favoriteCount}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setSelectedContent(null);
                    setLikeCount('');
                    setFavoriteCount('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleAddStats} className="flex-1 btn-primary">
                  确认增加
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 设置置顶弹窗 */}
      <Modal
        isOpen={showStickyModal}
        onClose={() => {
          setShowStickyModal(false);
          setSelectedContent(null);
        }}
        title="确认置顶帖子"
        size="sm"
      >
        <div className="p-6">
          {selectedContent && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  确认置顶此帖子？
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">标题：{selectedContent.title}</p>
                  <p className="text-gray-600 line-clamp-2">{selectedContent.text}</p>
                </div>
                <div className="mt-2 text-xs text-blue-600 italic">
                  置顶后，帖子将出现在列表最上方。
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStickyModal(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleSticky} className="flex-1 btn-primary">
                  确认置顶
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
