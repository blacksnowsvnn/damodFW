'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Không hiển thị Navbar trên các trang dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return <Navbar />;
}
