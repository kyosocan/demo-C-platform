'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 管理员默认重定向到审核队列
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/review');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff2442] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
