'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Database, Globe, User, AlertCircle, Loader2 } from 'lucide-react';

export default function InstallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Database
    db_user: 'damod_user',
    db_password: 'damod_password',
    db_name: 'damod_db',
    db_host: 'db',
    db_port: '5432',
    // System
    app_name: 'Damod Project',
    domain: 'localhost',
    // Admin
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

  const testDbConnection = async () => {
    setTestingDb(true);
    setError(null);
    try {
      await apiRequest('/install/test-db', {
        method: 'POST',
        body: JSON.stringify({
          db_user: formData.db_user,
          db_password: formData.db_password,
          db_name: formData.db_name,
          db_host: formData.db_host,
          db_port: formData.db_port,
        }),
      });
      alert('Kết nối Database thành công!');
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối tới Database.');
    } finally {
      setTestingDb(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
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
          db_config: {
            db_user: formData.db_user,
            db_password: formData.db_password,
            db_name: formData.db_name,
            db_host: formData.db_host,
            db_port: formData.db_port,
          },
          domain_config: {
            app_name: formData.app_name,
            domain: formData.domain,
          },
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          admin_full_name: formData.admin_full_name,
        }),
      });
      alert('Cài đặt thành công! Hệ thống đang được khởi tạo.');
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình cài đặt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Đang kiểm tra hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center border-b bg-white rounded-t-xl">
          <CardTitle className="text-3xl font-bold text-gray-900">Thiết lập hệ thống</CardTitle>
          <CardDescription className="text-base">
            Hoàn thành 3 bước đơn giản để bắt đầu sử dụng DamodFW
          </CardDescription>
          
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
              <Globe className="h-5 w-5" />
            </div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
              <User className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cấu hình Database</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="db_host">Host</Label>
                    <Input id="db_host" name="db_host" value={formData.db_host} onChange={handleChange} placeholder="db" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db_port">Port</Label>
                    <Input id="db_port" name="db_port" value={formData.db_port} onChange={handleChange} placeholder="5432" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db_name">Tên Database</Label>
                  <Input id="db_name" name="db_name" value={formData.db_name} onChange={handleChange} placeholder="damod_db" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db_user">Tên người dùng</Label>
                  <Input id="db_user" name="db_user" value={formData.db_user} onChange={handleChange} placeholder="damod_user" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db_password">Mật khẩu</Label>
                  <Input id="db_password" name="db_password" type="password" value={formData.db_password} onChange={handleChange} placeholder="••••••••" />
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={testDbConnection}
                  disabled={testingDb}
                >
                  {testingDb ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra...</> : 'Kiểm tra kết nối'}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cấu hình Hệ thống</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_name">Tên ứng dụng</Label>
                  <Input id="app_name" name="app_name" value={formData.app_name} onChange={handleChange} placeholder="Damod Project" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Tên miền (Domain)</Label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm">
                      http://
                    </span>
                    <Input id="domain" name="domain" className="rounded-l-none" value={formData.domain} onChange={handleChange} placeholder="localhost" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 italic">* Dùng để cấu hình Nginx và API Endpoint</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tài khoản Quản trị</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_full_name">Họ và tên</Label>
                  <Input id="admin_full_name" name="admin_full_name" value={formData.admin_full_name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email quản trị</Label>
                  <Input id="admin_email" name="admin_email" type="email" value={formData.admin_email} onChange={handleChange} placeholder="admin@example.com" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Mật khẩu</Label>
                    <Input id="admin_password" name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} placeholder="••••••••" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Xác nhận</Label>
                    <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} placeholder="••••••••" required />
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50 p-6 rounded-b-xl">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} disabled={submitting}>
              Quay lại
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
              Tiếp theo
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang thiết lập...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất cài đặt</>}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
