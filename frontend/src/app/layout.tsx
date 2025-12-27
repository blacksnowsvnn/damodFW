import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import InstallGuard from "@/components/InstallGuard";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

// Force dynamic rendering to ensure settings are always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Giữ nguyên hàm này để lấy metadata cho SEO
async function getPublicSettings() {
  try {
    // Sử dụng URL internal trong Docker network
    // Backend service name là 'backend' và expose port 8000
    const baseUrl = 'http://backend:8000/api/v1';
    const res = await fetch(`${baseUrl}/settings/public`, {
      cache: 'no-store', // Quan trọng: không cache để luôn lấy settings mới nhất
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      console.warn("API response not OK:", res.status, res.statusText);
      return {};
    }
    return await res.json();
  } catch (error) {
    console.error("Could not fetch public settings:", error instanceof Error ? error.message : error);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: settings.site_title || "Damod App - Quản lý thành viên",
    description: settings.site_description || "Hệ thống quản lý thành viên hiện đại và bảo mật",
    keywords: settings.site_keywords || "",
    openGraph: {
      title: settings.site_title,
      description: settings.site_description,
      images: settings.og_image ? [{ url: settings.og_image }] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings trực tiếp trong component server để render CSS variables
  const settings = await getPublicSettings();
  const selectedBaseStyle = settings.theme_base_style || "neutral";

  // Tạo style string để inject CSS variables
  // QUAN TRỌNG:
  // 1. Thêm !important để override các style mặc định
  // 2. Thêm selector :root và .dark rõ ràng
  // 3. Xử lý radius: Nếu radius = 0, set trực tiếp 0px để tránh lỗi tính toán calc() trong globals.css
  const radiusValue = settings.theme_radius === "0" ? "0px" : `${settings.theme_radius || "0.625"}rem`;

  const customStyles = `
    :root {
      --radius: ${radiusValue} !important;
      ${settings.theme_primary_color ? `--primary: oklch(${settings.theme_primary_color}) !important;` : ""}
    }
    .dark {
      ${settings.theme_primary_color ? `--primary: oklch(${settings.theme_primary_color}) !important;` : ""}
    }
  `;

  return (
    // Thêm key={Date.now()} để ép React render lại toàn bộ layout khi settings thay đổi sau khi reload
    <html lang="vi" suppressHydrationWarning data-theme-base={selectedBaseStyle}>
      <head>
        {/* Inject dynamic styles */}
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />

        {settings.header_scripts && (
          <script dangerouslySetInnerHTML={{ __html: settings.header_scripts }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark"]}
        >
          <InstallGuard>
            <ConditionalNavbar />
            {children}
          </InstallGuard>
          <Toaster position="top-right" richColors />
          {settings.body_scripts && (
            <script dangerouslySetInnerHTML={{ __html: settings.body_scripts }} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
