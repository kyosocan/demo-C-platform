'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Power,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Reviewer } from '@/types';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDate, generateId } from '@/lib/utils';

export default function ReviewersManagement() {
  const { 
    reviewers, 
    addReviewer, 
    deleteReviewer, 
    updateReviewerStatus,
    contents,
    unassignTask,
    reviewRecords,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // 新建审核员表单
  const [newReviewer, setNewReviewer] = useState({
    username: '',
    password: '',
    name: '',
    queueCapacity: 10,
  });

  // 搜索过滤
  const filteredReviewers = useMemo(() => {
    return reviewers.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reviewers, searchTerm]);

  // 获取审核员统计
  const getReviewerStats = (reviewerId: string) => {
    const records = reviewRecords.filter((r) => r.reviewerId === reviewerId);
    return {
      total: records.length,
      approved: records.filter((r) => r.action === 'approved').length,
      rejected: records.filter((r) => r.action === 'rejected').length,
      overturned: records.filter((r) => r.isOverturned).length,
    };
  };

  // 添加审核员
  const handleAddReviewer = () => {
    if (!newReviewer.username || !newReviewer.password || !newReviewer.name) {
      toast.error('请填写完整信息');
      return;
    }

    // 检查用户名是否重复
    if (reviewers.some((r) => r.username === newReviewer.username)) {
      toast.error('用户名已存在');
      return;
    }

    const reviewer: Reviewer = {
      id: generateId('reviewer-'),
      username: newReviewer.username,
      password: newReviewer.password,
      name: newReviewer.name,
      role: 'reviewer',
      status: 'offline',
      queueCapacity: newReviewer.queueCapacity,
      currentQueueCount: 0,
      createdAt: new Date().toISOString(),
    };

    addReviewer(reviewer);
    toast.success('审核员添加成功');
    setShowAddModal(false);
    setNewReviewer({ username: '', password: '', name: '', queueCapacity: 10 });
  };

  // 删除审核员
  const handleDeleteReviewer = (id: string) => {
    // 先回收该审核员的所有任务
    const assignedContents = contents.filter((c) => c.assignedTo === id);
    assignedContents.forEach((c) => unassignTask(c.id));

    deleteReviewer(id);
    toast.success('审核员已删除');
    setShowDeleteConfirm(null);
  };

  // 切换审核员状态
  const handleToggleStatus = (reviewer: Reviewer) => {
    const newStatus = reviewer.status === 'online' ? 'offline' : 'online';
    
    if (newStatus === 'offline') {
      // 离线时回收所有任务
      const assignedContents = contents.filter((c) => c.assignedTo === reviewer.id);
      assignedContents.forEach((c) => unassignTask(c.id));
    }

    updateReviewerStatus(reviewer.id, newStatus);
    toast.success(`${reviewer.name} 已${newStatus === 'online' ? '上线' : '下线'}`);
    setMenuOpen(null);
  };

  // 回收任务
  const handleRecallTasks = (reviewerId: string) => {
    const assignedContents = contents.filter((c) => c.assignedTo === reviewerId);
    assignedContents.forEach((c) => unassignTask(c.id));
    toast.success(`已回收 ${assignedContents.length} 条任务`);
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen">
      <Header title="审核员管理" subtitle="管理审核员账号和权限" />

      <div className="p-6">
        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索审核员..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加审核员
          </button>
        </div>

        {/* 审核员列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  审核员
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  队列
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  审核统计
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  创建时间
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviewers.map((reviewer) => {
                const stats = getReviewerStats(reviewer.id);
                return (
                  <tr key={reviewer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {reviewer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{reviewer.name}</p>
                          <p className="text-sm text-gray-500">@{reviewer.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 badge ${
                          reviewer.status === 'online' ? 'badge-success' : 'badge-gray'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            reviewer.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {reviewer.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ff2442] rounded-full transition-all"
                            style={{
                              width: `${(reviewer.currentQueueCount / reviewer.queueCapacity) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {reviewer.currentQueueCount}/{reviewer.queueCapacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-600">总: {stats.total}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-green-600">过: {stats.approved}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-red-600">拒: {stats.rejected}</span>
                        {stats.overturned > 0 && (
                          <>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-orange-600">翻: {stats.overturned}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(reviewer.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setMenuOpen(menuOpen === reviewer.id ? null : reviewer.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {menuOpen === reviewer.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                            <button
                              onClick={() => handleToggleStatus(reviewer)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Power className="w-4 h-4" />
                              {reviewer.status === 'online' ? '强制下线' : '强制上线'}
                            </button>
                            {reviewer.currentQueueCount > 0 && (
                              <button
                                onClick={() => handleRecallTasks(reviewer.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <RotateCcw className="w-4 h-4" />
                                回收任务
                              </button>
                            )}
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(reviewer.id);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              删除账号
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredReviewers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              暂无审核员数据
            </div>
          )}
        </div>
      </div>

      {/* 添加审核员弹窗 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加审核员"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="label">姓名</label>
            <input
              type="text"
              value={newReviewer.name}
              onChange={(e) =>
                setNewReviewer({ ...newReviewer, name: e.target.value })
              }
              className="input"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="label">用户名</label>
            <input
              type="text"
              value={newReviewer.username}
              onChange={(e) =>
                setNewReviewer({ ...newReviewer, username: e.target.value })
              }
              className="input"
              placeholder="请输入登录用户名"
            />
          </div>
          <div>
            <label className="label">密码</label>
            <input
              type="password"
              value={newReviewer.password}
              onChange={(e) =>
                setNewReviewer({ ...newReviewer, password: e.target.value })
              }
              className="input"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label className="label">默认队列容量</label>
            <input
              type="number"
              value={newReviewer.queueCapacity}
              onChange={(e) =>
                setNewReviewer({
                  ...newReviewer,
                  queueCapacity: parseInt(e.target.value) || 10,
                })
              }
              min={1}
              max={50}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAddReviewer} className="flex-1 btn-primary">
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            确定要删除该审核员账号吗？此操作不可恢复，该审核员的所有待审核任务将被回收。
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={() => showDeleteConfirm && handleDeleteReviewer(showDeleteConfirm)}
              className="flex-1 btn-danger"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
