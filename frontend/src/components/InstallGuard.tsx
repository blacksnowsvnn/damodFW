'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function InstallGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Không kiểm tra nếu đang ở trang install
    if (pathname === '/install') {
      setChecking(false);
      return;
    }

    const checkInstall = async () => {
      try {
        const data = await apiRequest('/install/check');
        if (data.msg === 'not_installed') {
          router.push('/install');
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra cài đặt:', err);
        // Nếu lỗi (ví dụ backend chưa sẵn sàng), vẫn cho qua để tránh loop hoặc kẹt
        setChecking(false);
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
