'use client';

import { useState } from 'react';
import { 
  Shield, 
  X,
  Plus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/Layout/Header';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function BlacklistWhitelistPage() {
  const { 
    blacklistWhitelist, 
    addToBlacklistWhitelist, 
    removeFromBlacklistWhitelist 
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [note, setNote] = useState('');

  // 只显示黑名单
  const blacklist = blacklistWhitelist.filter((item) => item.type === 'blacklist');

  const handleAdd = () => {
    if (!userId.trim()) {
      toast.error('请输入用户ID');
      return;
    }

    addToBlacklistWhitelist(userId.trim(), 'blacklist', note.trim() || undefined);
    toast.success('已添加到黑名单');
    setShowAddModal(false);
    setUserId('');
    setNote('');
  };

  const handleRemove = (userId: string) => {
    removeFromBlacklistWhitelist(userId);
    toast.success('已从黑名单移除');
  };

  return (
    <div className="min-h-screen">
      <Header title="黑名单管理" subtitle="管理用户黑名单" />

      <div className="p-6">
        {/* 操作栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">黑名单管理</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加用户
          </button>
        </div>

        {/* 黑名单列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-800 text-white p-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-lg">黑名单</h3>
            <span className="ml-auto badge bg-white text-gray-800">
              {blacklist.length} 人
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {blacklist.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无黑名单用户</p>
              </div>
            ) : (
              blacklist.map((item) => (
                <div key={item.userId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">用户ID:</span>
                        <span className="font-mono text-sm text-gray-700">{item.userId}</span>
                      </div>
                      {item.note && (
                        <p className="text-sm text-gray-500 mt-1">备注: {item.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        添加时间: {formatDate(item.addedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.userId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="移除"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 添加用户弹窗 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setUserId('');
          setNote('');
        }}
        title="添加用户到黑名单"
      >
        <div className="p-6">
          <div className="mb-6">
            <label className="label">用户ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input"
              placeholder="请输入用户ID"
            />
          </div>

          <div className="mb-6">
            <label className="label">备注（可选）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="请输入备注信息..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                setUserId('');
                setNote('');
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button onClick={handleAdd} className="flex-1 btn-primary">
              确认添加
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
