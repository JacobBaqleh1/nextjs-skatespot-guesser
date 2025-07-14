"use client";

import { usePathname } from "next/navigation";
// import Navbar from "./Navbar";

const HIDDEN_NAVBAR_ROUTES = [
  "/dashboard/game",

  // Add more routes as needed
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = HIDDEN_NAVBAR_ROUTES.includes(pathname);

  return (
    <>
      {/* {!hideNavbar && <Navbar />} */}
      <main className={hideNavbar ? "" : ""}>{children}</main>
    </>
  );
}
