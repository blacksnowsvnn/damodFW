'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, removeToken, apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LogOut, User, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<{ email: string; rank: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await apiRequest('/members/me');
          setUser(userData);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          removeToken();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();
    
    // Lắng nghe sự kiện thay đổi storage để cập nhật trạng thái
    const handleStorageChange = () => fetchUser();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Lỗi khi gọi API logout:', error);
    } finally {
      removeToken();
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tighter">
              Damod
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center mr-2 text-sm text-gray-600 font-medium">
                  <User className="h-4 w-4 mr-1" />
                  {user.email}
                </div>
                {user.rank < 5 && (
                  <Link href="/dashboard">
                    <Button variant="outline" className="text-blue-600 border-blue-100 hover:bg-blue-50">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Đăng ký</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
