'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const appName = "Damod App";

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 sm:p-24 bg-gray-50">
      <div className="text-center space-y-8 bg-white p-8 sm:p-16 rounded-3xl shadow-2xl max-w-4xl w-full border border-gray-100">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
            Chào mừng đến với <span className="text-blue-600">{appName}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Giải pháp quản lý thành viên toàn diện, bảo mật và hiệu quả cho doanh nghiệp của bạn.
          </p>
        </div>
        
        {!isLoggedIn ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-lg rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-7 text-lg rounded-xl border-2 hover:bg-gray-50 transition-all">
                Tìm hiểu thêm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-700 font-semibold text-lg">
              Bạn đã đăng nhập! Hãy khám phá các tính năng quản lý của hệ thống.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/members">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Quản lý thành viên
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-100">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Bảo mật cao</h3>
            <p className="text-gray-500 text-sm">Xác thực JWT đa tầng và mã hóa mật khẩu hiện đại.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Tốc độ tối ưu</h3>
            <p className="text-gray-500 text-sm">Xây dựng trên FastAPI và Next.js cho trải nghiệm mượt mà.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Dễ quản lý</h3>
            <p className="text-gray-500 text-sm">Giao diện trực quan giúp bạn kiểm soát mọi thứ dễ dàng.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
