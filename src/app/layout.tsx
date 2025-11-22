import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { DashboardStatsProvider } from "@/context/DashboardStatsContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "My Healthcare App",
  description: "Doctor requests and approvals system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
            <UserProfileProvider>
        <DashboardStatsProvider>
            {children}
        </DashboardStatsProvider>
        </UserProfileProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}