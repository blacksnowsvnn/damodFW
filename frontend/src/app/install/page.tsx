'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function InstallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    site_title: 'Damod Website',
    admin_email: '',
    admin_full_name: '',
    admin_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await apiRequest('/install/check');
        if (data.msg === 'installed') {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái cài đặt:', err);
        setLoading(false);
      }
    };
    checkStatus();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.admin_password !== formData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/install/setup', {
        method: 'POST',
        body: JSON.stringify({
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          admin_full_name: formData.admin_full_name,
          site_title: formData.site_title,
        }),
      });
      alert('Cài đặt thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình cài đặt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cài đặt hệ thống</h1>
          <p className="mt-2 text-sm text-gray-600">
            Chào mừng! Hãy thiết lập các thông tin cơ bản để bắt đầu.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên Website</label>
              <input
                type="text"
                name="site_title"
                required
                value={formData.site_title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ví dụ: My Awesome Blog"
              />
            </div>

            <hr className="my-6 border-gray-200" />
            <h3 className="text-lg font-medium text-gray-900">Tài khoản Quản trị</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                type="text"
                name="admin_full_name"
                required
                value={formData.admin_full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Admin</label>
              <input
                type="email"
                name="admin_email"
                required
                value={formData.admin_email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input
                type="password"
                name="admin_password"
                required
                value={formData.admin_password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:bg-blue-400"
          >
            {submitting ? 'Đang thực hiện cài đặt...' : 'Bắt đầu ngay'}
          </Button>
        </form>
      </div>
    </div>
  );
}
