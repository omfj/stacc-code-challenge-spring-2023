import Header from "./Header";
import type { ReactNode } from "react";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-3 sm:px-10">{children}</main>
      <div className="flex-grow" />
      <Footer />
    </div>
  );
};

export default Layout;
