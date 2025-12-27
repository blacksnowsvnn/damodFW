'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getToken } from '@/lib/api';

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const user = await apiRequest('/members/me');
        
        // Chỉ cho phép member có rank < 5 truy cập dashboard
        // Rank 0: Admin, 1-4: Staff/Special, 5: Member (Lowest)
        if (user.rank < 5) {
          setAuthorized(true);
        } else {
          // Nếu rank >= 5, chuyển hướng về trang chủ hoặc thông báo lỗi
          router.push('/');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra quyền truy cập:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang kiểm tra quyền hạn...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Tránh flash nội dung khi đang redirect
  }

  return <>{children}</>;
}
