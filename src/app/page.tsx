'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ToastContainer, toast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && currentUser) {
      // 已登录，跳转到对应页面
      if (currentUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/reviewer');
      }
    }
  }, [currentUser, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const user = login(username, password);
    
    if (user) {
      toast.success('登录成功');
      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/reviewer');
        }
      }, 500);
    } else {
      toast.error('用户名或密码错误');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] to-[#ffe4e6] flex items-center justify-center p-4">
      <ToastContainer />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff2442] rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">社</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">社区审核后台</h1>
          <p className="text-gray-500 mt-2">社区内容安全管理系统</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="label">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              )}
            </button>
          </form>

          {/* 测试账号提示 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">测试账号</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>管理员:</span>
                <code className="bg-gray-200 px-2 py-0.5 rounded">admin / admin123</code>
              </div>
              <div className="flex justify-between">
                <span>审核员:</span>
                <code className="bg-gray-200 px-2 py-0.5 rounded">reviewer1 / 123456</code>
              </div>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2024 社区审核后台 Demo
        </p>
      </div>
    </div>
  );
}
