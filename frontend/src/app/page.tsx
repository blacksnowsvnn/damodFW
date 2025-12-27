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
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 sm:p-24 bg-background transition-colors duration-300">
      <div className="text-center space-y-8 bg-card p-8 sm:p-16 rounded-3xl sm:rounded-[3rem] shadow-2xl max-w-4xl w-full border border-border">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight">
            Chào mừng đến với <span className="text-primary">{appName}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Giải pháp quản lý thành viên toàn diện, bảo mật và hiệu quả cho doanh nghiệp của bạn.
          </p>
        </div>
        
        {!isLoggedIn ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-7 text-lg rounded-xl border-2 hover:bg-accent hover:text-accent-foreground transition-all">
                Tìm hiểu thêm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 p-6 bg-primary/10 rounded-2xl border border-primary/20">
            <p className="text-primary font-semibold text-lg">
              Bạn đã đăng nhập! Hãy khám phá các tính năng quản lý của hệ thống.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/members">
                <Button className="shadow-lg shadow-primary/20">
                  Quản lý thành viên
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-chart-1/20 rounded-2xl text-[oklch(var(--chart-1))]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Bảo mật cao</h3>
            <p className="text-muted-foreground text-sm">Xác thực JWT đa tầng và mã hóa mật khẩu hiện đại.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-chart-2/20 rounded-2xl text-[oklch(var(--chart-2))]">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Tốc độ tối ưu</h3>
            <p className="text-muted-foreground text-sm">Xây dựng trên FastAPI và Next.js cho trải nghiệm mượt mà.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-chart-3/20 rounded-2xl text-[oklch(var(--chart-3))]">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Dễ quản lý</h3>
            <p className="text-muted-foreground text-sm">Giao diện trực quan giúp bạn kiểm soát mọi thứ dễ dàng.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
