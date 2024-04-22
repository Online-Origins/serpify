import type { Metadata } from "next";
import "@/styles/global.scss";
import styles from "./index.module.scss";
import MenuBar from "@/components/menu-bar/menu-bar.component";
import ComponentWrapper from "@/components/ui/component-wrapper/component-wrapper.component";
import classNames from "classnames";

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
      <body>
        <MenuBar />
        <ComponentWrapper
          className={classNames(
            styles.pagesWrapper
            // !smallNav && styles.smallerWrapper
          )}
        >
          <div className={styles.innerWrapper}>{children}</div>
        </ComponentWrapper>
      </body>
    </html>
  );
}
