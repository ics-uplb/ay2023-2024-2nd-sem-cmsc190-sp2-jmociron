import "../styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import AuthContext from "./AuthContext";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`bg-slate-100 ${inter.className}`}>
        <AuthContext>
          {children}
        </AuthContext>
        <Toaster />
        </body>
    </html>
  );
}
