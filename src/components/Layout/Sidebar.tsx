'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CheckCircle, 
  History, 
  Users, 
  FileCheck, 
  BookOpen, 
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: ('admin' | 'reviewer')[];
}

const navItems: NavItem[] = [
  // 审核员菜单
  {
    href: '/reviewer',
    label: '审核工作台',
    icon: <CheckCircle className="w-5 h-5" />,
    roles: ['reviewer'],
  },
  {
    href: '/reviewer/history',
    label: '审核记录',
    icon: <History className="w-5 h-5" />,
    roles: ['reviewer'],
  },
  {
    href: '/reviewer/standards',
    label: '审核标准',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['reviewer'],
  },
  // 管理员菜单
  {
    href: '/admin/reviewers',
    label: '审核员管理',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href: '/admin/review',
    label: '审核队列',
    icon: <FileCheck className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href: '/admin/standards',
    label: '审核标准',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    href: '/admin/statistics',
    label: '数据统计',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAppStore();

  if (!currentUser) return null;

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff2442] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">社</span>
          </div>
          <span className="font-bold text-lg text-gray-800">社区审核后台</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && item.href !== '/reviewer' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-[#fff5f5] text-[#ff2442]'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 用户信息 */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500">
              {currentUser.role === 'admin' ? '管理员' : '审核员'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
