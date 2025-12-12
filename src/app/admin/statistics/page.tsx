'use client';

import { useState, useMemo } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Users
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/Layout/Header';
import { toast } from '@/components/ui/Toast';
import { exportToCSV, formatDate } from '@/lib/utils';

type DateRange = 'today' | 'week' | 'month' | 'all';

export default function Statistics() {
  const { reviewers, reviewRecords, contents } = useAppStore();
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // 根据日期范围过滤记录
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return reviewRecords;
    }

    return reviewRecords.filter(
      (r) => new Date(r.reviewedAt) >= startDate
    );
  }, [reviewRecords, dateRange]);

  // 计算整体统计
  const overallStats = useMemo(() => {
    const totalReviewed = filteredRecords.length;
    const approved = filteredRecords.filter((r) => r.action === 'approved').length;
    const rejected = filteredRecords.filter((r) => r.action === 'rejected').length;
    const overturned = filteredRecords.filter((r) => r.isOverturned).length;
    const reported = filteredRecords.filter((r) => r.content.source === 'reported').length;

    return {
      totalReviewed,
      approved,
      rejected,
      overturned,
      reported,
      approvalRate: totalReviewed > 0 ? ((approved / totalReviewed) * 100).toFixed(1) : '0',
      overturnRate: totalReviewed > 0 ? ((overturned / totalReviewed) * 100).toFixed(1) : '0',
      reportedRate: totalReviewed > 0 ? ((reported / totalReviewed) * 100).toFixed(1) : '0',
    };
  }, [filteredRecords]);

  // 计算每位审核员的统计
  const reviewerStats = useMemo(() => {
    return reviewers.map((reviewer) => {
      const records = filteredRecords.filter((r) => r.reviewerId === reviewer.id);
      const approved = records.filter((r) => r.action === 'approved').length;
      const rejected = records.filter((r) => r.action === 'rejected').length;
      const overturned = records.filter((r) => r.isOverturned).length;
      const reported = records.filter((r) => r.content.source === 'reported').length;

      return {
        id: reviewer.id,
        name: reviewer.name,
        username: reviewer.username,
        status: reviewer.status,
        totalReviewed: records.length,
        approved,
        rejected,
        overturned,
        reported,
        overturnRate: records.length > 0 ? ((overturned / records.length) * 100).toFixed(1) : '0',
      };
    }).sort((a, b) => b.totalReviewed - a.totalReviewed);
  }, [reviewers, filteredRecords]);

  // 导出CSV
  const handleExport = () => {
    const data = reviewerStats.map((stat) => ({
      审核员姓名: stat.name,
      用户名: stat.username,
      状态: stat.status === 'online' ? '在线' : '离线',
      总审核数: stat.totalReviewed,
      通过数: stat.approved,
      拒绝数: stat.rejected,
      被推翻数: stat.overturned,
      推翻率: `${stat.overturnRate}%`,
      举报内容数: stat.reported,
    }));

    const dateRangeText = {
      today: '今日',
      week: '近7天',
      month: '近30天',
      all: '全部',
    }[dateRange];

    exportToCSV(data, `审核统计_${dateRangeText}_${formatDate(new Date())}`);
    toast.success('导出成功');
  };

  const statCards = [
    {
      title: '总审核量',
      value: overallStats.totalReviewed,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '通过数',
      value: overallStats.approved,
      subValue: `${overallStats.approvalRate}%`,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: '拒绝数',
      value: overallStats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: '被推翻数',
      value: overallStats.overturned,
      subValue: `${overallStats.overturnRate}%`,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: '举报内容',
      value: overallStats.reported,
      subValue: `${overallStats.reportedRate}%`,
      icon: Flag,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '审核员数',
      value: reviewers.length,
      subValue: `${reviewers.filter((r) => r.status === 'online').length} 在线`,
      icon: Users,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="min-h-screen">
      <Header title="数据统计" subtitle="审核数据统计与分析（用于发工资）" />

      <div className="p-6">
        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="input w-auto"
            >
              <option value="today">今日</option>
              <option value="week">近 7 天</option>
              <option value="month">近 30 天</option>
              <option value="all">全部时间</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            导出 CSV
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className={`inline-flex p-2 rounded-lg ${card.bgColor} mb-3`}>
                  <Icon className={`w-5 h-5 text-${card.color.replace('bg-', '')}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.title}</p>
                {card.subValue && (
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* 审核员详细统计 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">审核员统计明细</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    排名
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    审核员
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    状态
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    总审核数
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    通过数
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    拒绝数
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    被推翻数
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    推翻率
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                    举报内容
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviewerStats.map((stat, index) => (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {stat.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{stat.name}</p>
                          <p className="text-xs text-gray-500">@{stat.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 badge ${
                          stat.status === 'online' ? 'badge-success' : 'badge-gray'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {stat.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-800">{stat.totalReviewed}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-600 font-medium">{stat.approved}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-red-600 font-medium">{stat.rejected}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-medium ${
                          stat.overturned > 0 ? 'text-orange-600' : 'text-gray-400'
                        }`}
                      >
                        {stat.overturned}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`${
                          parseFloat(stat.overturnRate) > 10
                            ? 'text-red-600 font-medium'
                            : parseFloat(stat.overturnRate) > 5
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {stat.overturnRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-purple-600">{stat.reported}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reviewerStats.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                暂无统计数据
              </div>
            )}
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h4 className="font-medium text-blue-800 mb-2">数据说明</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 推翻率 = 被推翻数 / 总审核数 × 100%</li>
            <li>• 推翻率过高（&gt;10%）的审核员需要重点关注</li>
            <li>• 举报内容数表示审核员处理的来自用户举报的内容数量</li>
            <li>• 导出的 CSV 文件可用于计算工资和绩效考核</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
