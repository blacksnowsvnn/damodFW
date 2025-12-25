'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function InstallGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkInstall = async () => {
      try {
        const data = await apiRequest('/install/check');
        if (data.msg === 'not_installed') {
          if (pathname !== '/install') {
            router.push('/install');
          }
        } else {
          // Nếu đã cài đặt mà cố truy cập /install thì đá về trang chủ
          if (pathname === '/install') {
            router.push('/');
          }
          setChecking(false);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra cài đặt:', err);
        // Nếu lỗi (ví dụ backend chưa sẵn sàng), mặc định coi là chưa cài đặt và đẩy về /install
        if (pathname !== '/install') {
          router.push('/install');
        } else {
          setChecking(false);
        }
      }
    };

    checkInstall();
  }, [pathname, router]);

  if (checking && pathname !== '/install') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang khởi động hệ thống...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
