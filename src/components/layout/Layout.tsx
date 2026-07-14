import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-grow flex flex-col pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
