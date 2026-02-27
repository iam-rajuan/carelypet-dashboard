// app/layout.tsx
import "./globals.css";

import StoreProvider from "./store/StoreProvider";

export const metadata = {
  title: "Carely Pets Dashboard",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
