import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '社区审核后台',
  description: '社区内容审核后台管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
