'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

// 首页直接跳转到审核工作台
export default function HomePage() {
  const router = useRouter();
  const { currentUser, reviewers, setCurrentUser } = useAppStore();

  useEffect(() => {
    // 如果没有当前用户，自动设置第一个审核员为当前用户
    if (!currentUser && reviewers.length > 0) {
      setCurrentUser(reviewers[0]);
    }
    // 跳转到审核工作台
    router.replace('/reviewer');
  }, [router, currentUser, reviewers, setCurrentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff2442] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
