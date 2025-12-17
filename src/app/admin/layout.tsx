'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/Layout/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, reviewers, setCurrentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !currentUser && reviewers.length > 0) {
      // 如果没有当前用户，自动设置第一个审核员为当前用户
      setCurrentUser(reviewers[0]);
    }
  }, [mounted, currentUser, reviewers, setCurrentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
