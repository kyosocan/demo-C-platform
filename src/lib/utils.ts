import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 格式化日期
export function formatDate(date: string | Date) {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
}

// 相对时间
export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
}

// 生成唯一ID
export function generateId(prefix: string = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 脱敏处理
export function maskString(str: string, showFirst: number = 1, showLast: number = 1) {
  if (str.length <= showFirst + showLast) {
    return str[0] + '*'.repeat(str.length - 1);
  }
  const first = str.slice(0, showFirst);
  const last = str.slice(-showLast);
  const masked = '*'.repeat(Math.min(str.length - showFirst - showLast, 3));
  return `${first}${masked}${last}`;
}

// 导出CSV
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号或换行的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

// 类名合并工具
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
