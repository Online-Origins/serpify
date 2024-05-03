import type { Metadata } from "next";
import "@/styles/global.scss";
import AppWrapper from "./app-wrapper";

export const metadata: Metadata = {
  title: "Serpify | Automate SEO, Optimize Visibility, Dominate Online",
  description:
    "Automate SEO tasks for improved rankings and visibility, optimize your online visibility effortlessly and take control of your digital presence today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <AppWrapper>{children}</AppWrapper>
    </html>
  );
}
