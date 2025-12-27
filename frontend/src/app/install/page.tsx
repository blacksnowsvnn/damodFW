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


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Database
    db_user: '',
    db_password: '',
    db_name: '',
    db_host: 'db',
    db_port: '5432',
    create_new: true,
    force_reset: false,
    root_user: 'postgres',
    root_password: '',
    // System
    app_name: '',
    domain: '',
    // Admin
    admin_email: '',
    admin_full_name: '',
    admin_password: '',
    confirm_password: '',
    // pgAdmin (Sẽ tự động lấy từ Admin account)
    pgadmin_email: '',
    pgadmin_password: '',
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

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'app_name':
        if (value.length < 2) error = 'Tên ứng dụng phải có ít nhất 2 ký tự';
        break;
      case 'domain':
        if (value.length < 3) error = 'Tên miền phải có ít nhất 3 ký tự';
        break;
      case 'db_name':
      case 'db_user':
        if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Chỉ chấp nhận chữ cái, số và dấu gạch dưới';
        if (value.length < 3) error = 'Phải có ít nhất 3 ký tự';
        break;
      case 'db_password':
      case 'admin_password':
        if (value.length < 6) error = 'Mật khẩu phải có ít nhất 6 ký tự';
        break;
      case 'admin_email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email không hợp lệ';
        break;
      case 'admin_full_name':
        if (value.length < 2) error = 'Họ tên phải có ít nhất 2 ký tự';
        break;
      case 'confirm_password':
        if (value !== formData.admin_password) error = 'Mật khẩu xác nhận không khớp';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    if (type !== 'checkbox') {
      validateField(name, newValue);
    }
  };

  const testDbConnection = async () => {
    const fieldsToValidate = ['db_name', 'db_user', 'db_password'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, (formData as any)[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setError('Vui lòng điền đúng thông tin database trước khi kiểm tra.');
      return;
    }

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
          create_new: formData.create_new,
          root_user: formData.root_user,
          root_password: formData.root_password,
        }),
      });
      alert('Kết nối Database thành công!');
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối tới Database.');
      if (formData.force_reset) {
        setCanSkipTest(true);
      }
    } finally {
      setTestingDb(false);
    }
  };

  const nextStep = () => {
    const fieldsToValidate = ['app_name', 'domain', 'db_name', 'db_user', 'db_password'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, (formData as any)[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setError('Vui lòng kiểm tra lại các thông tin đã nhập.');
      return;
    }

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

    const fieldsToValidate = ['admin_full_name', 'admin_email', 'admin_password', 'confirm_password'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, (formData as any)[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setError('Vui lòng kiểm tra lại các thông tin đã nhập.');
      return;
    }

    setSubmitting(true);
    try {
      // Tự động sử dụng thông tin Admin cho pgAdmin nếu chưa có
      const pgadmin_email = formData.pgadmin_email || formData.admin_email;
      const pgadmin_password = formData.pgadmin_password || formData.admin_password;

      await apiRequest('/install/setup', {
        method: 'POST',
        body: JSON.stringify({
          db_config: {
            db_user: formData.db_user,
            db_password: formData.db_password,
            db_name: formData.db_name,
            db_host: formData.db_host,
            db_port: formData.db_port,
            create_new: formData.create_new,
            force_reset: formData.force_reset,
            root_user: formData.root_user,
            root_password: formData.root_password,
          },
          domain_config: {
            app_name: formData.app_name,
            domain: formData.domain,
          },
          pgadmin_config: {
            pgadmin_email: pgadmin_email,
            pgadmin_password: pgadmin_password,
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
            Hoàn thành 2 bước đơn giản để bắt đầu sử dụng DamodFW
          </CardDescription>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
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
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin dự án</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_name">Tên ứng dụng</Label>
                  <Input
                    id="app_name"
                    name="app_name"
                    value={formData.app_name}
                    onChange={handleChange}
                    placeholder="Damod Project"
                    className={errors.app_name ? 'border-red-500' : ''}
                  />
                  {errors.app_name && <p className="text-xs text-red-500">{errors.app_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Tên miền (Domain)</Label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm">
                      http://
                    </span>
                    <Input
                      id="domain"
                      name="domain"
                      className={`rounded-l-none ${errors.domain ? 'border-red-500' : ''}`}
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="localhost"
                    />
                  </div>
                  {errors.domain && <p className="text-xs text-red-500">{errors.domain}</p>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Cấu hình Database</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="db_name">Tên Database</Label>
                      <Input
                        id="db_name"
                        name="db_name"
                        value={formData.db_name}
                        onChange={handleChange}
                        placeholder="app_db"
                        className={errors.db_name ? 'border-red-500' : ''}
                      />
                      {errors.db_name && <p className="text-xs text-red-500">{errors.db_name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="db_user">User</Label>
                        <Input
                          id="db_user"
                          name="db_user"
                          value={formData.db_user}
                          onChange={handleChange}
                          placeholder="app_user"
                          className={errors.db_user ? 'border-red-500' : ''}
                        />
                        {errors.db_user && <p className="text-xs text-red-500">{errors.db_user}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="db_password">Password</Label>
                        <Input
                          id="db_password"
                          name="db_password"
                          type="password"
                          value={formData.db_password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={errors.db_password ? 'border-red-500' : ''}
                        />
                        {errors.db_password && <p className="text-xs text-red-500">{errors.db_password}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 py-4">
                    <input
                      type="checkbox"
                      id="force_reset"
                      name="force_reset"
                      checked={formData.force_reset}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                    />
                    <Label htmlFor="force_reset" className="text-sm font-medium leading-none text-red-600">
                      Xóa dữ liệu cũ nếu đã tồn tại
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={testDbConnection}
                    disabled={testingDb}
                  >
                    {testingDb ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra...</> : 'Kiểm tra kết nối DB'}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tài khoản Quản trị</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_full_name">Họ và tên</Label>
                  <Input
                    id="admin_full_name"
                    name="admin_full_name"
                    value={formData.admin_full_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                    className={errors.admin_full_name ? 'border-red-500' : ''}
                  />
                  {errors.admin_full_name && <p className="text-xs text-red-500">{errors.admin_full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email quản trị</Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    required
                    className={errors.admin_email ? 'border-red-500' : ''}
                  />
                  {errors.admin_email && <p className="text-xs text-red-500">{errors.admin_email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Mật khẩu</Label>
                    <Input
                      id="admin_password"
                      name="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={errors.admin_password ? 'border-red-500' : ''}
                    />
                    {errors.admin_password && <p className="text-xs text-red-500">{errors.admin_password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Xác nhận</Label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={errors.confirm_password ? 'border-red-500' : ''}
                    />
                    {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password}</p>}
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic mt-4">
                  * Thông tin này cũng sẽ được dùng để đăng nhập vào pgAdmin (Quản lý Database).
                </p>
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

          {step < 2 ? (
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
