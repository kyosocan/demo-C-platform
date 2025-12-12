'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, HelpCircle, Shield, Edit, Save, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/Layout/Header';
import { toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function AdminStandards() {
  const { currentUser, reviewStandards, updateReviewStandard } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('allowed');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const categories = [
    { id: 'allowed', label: '允许内容', icon: CheckCircle, color: 'text-green-600' },
    { id: 'prohibited', label: '禁止内容', icon: XCircle, color: 'text-red-600' },
    { id: 'reject_reasons', label: '拒绝理由', icon: HelpCircle, color: 'text-blue-600' },
    { id: 'copyright', label: '侵权判断', icon: Shield, color: 'text-purple-600' },
  ];

  const activeStandard = reviewStandards.find((s) => s.category === activeCategory);

  // 开始编辑
  const handleStartEdit = () => {
    if (activeStandard) {
      setEditContent(activeStandard.content);
      setIsEditing(true);
    }
  };

  // 保存编辑
  const handleSave = () => {
    if (activeStandard && currentUser) {
      updateReviewStandard(activeStandard.id, {
        content: editContent,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      });
      toast.success('审核标准已更新');
      setIsEditing(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  // 简单的 Markdown 渲染
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-800">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-700">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="ml-4 mb-1 text-gray-600">
              {line.replace('- ', '')}
            </li>
          );
        }
        if (line.startsWith('|---')) {
          return null;
        }
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(Boolean);
          const isHeader = index < 2;
          return (
            <tr key={index} className={isHeader ? 'bg-gray-100' : ''}>
              {cells.map((cell, cellIndex) => (
                isHeader ? (
                  <th key={cellIndex} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                    {cell.trim()}
                  </th>
                ) : (
                  <td key={cellIndex} className="border border-gray-300 px-3 py-2">
                    {cell.trim()}
                  </td>
                )
              ))}
            </tr>
          );
        }
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={index} className="mb-2 text-gray-600">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <strong key={partIndex} className="font-semibold text-gray-800">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        }
        if (line.trim()) {
          return (
            <p key={index} className="mb-2 text-gray-600">
              {line}
            </p>
          );
        }
        return null;
      });
  };

  const hasTable = activeStandard?.content.includes('|');

  return (
    <div className="min-h-screen">
      <Header title="审核标准管理" subtitle="维护和更新审核规范文档" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* 左侧分类导航 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">文档分类</span>
              </div>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setIsEditing(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-[#fff5f5] text-[#ff2442]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#ff2442]' : cat.color}`} />
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {activeStandard ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {activeStandard.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        最后更新：{formatDate(activeStandard.updatedAt)}
                      </p>
                    </div>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="btn-secondary flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          取消
                        </button>
                        <button
                          onClick={handleSave}
                          className="btn-primary flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartEdit}
                        className="btn-outline flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </button>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {isEditing ? (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          支持 Markdown 格式（标题、列表、加粗等）
                        </p>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-[500px] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff2442] focus:border-transparent resize-none"
                        />
                      </div>
                    ) : hasTable ? (
                      <div>
                        {renderMarkdown(activeStandard.content.split('|')[0])}
                        <table className="w-full border-collapse mb-4">
                          <tbody>
                            {renderMarkdown(activeStandard.content)}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        {renderMarkdown(activeStandard.content)}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  请选择一个分类查看
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
