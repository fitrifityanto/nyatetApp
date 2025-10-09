import React, { type JSX } from "react";
import { getPlainText } from "@/utils/markdown";

interface CustomHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3; // Menentukan level heading
}

const CustomHeading = ({ children, level }: CustomHeadingProps) => {
  const textContent = getPlainText(children);
  const hasArabic =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      textContent,
    );

  const Tag = `h${String(level)}` as keyof JSX.IntrinsicElements;

  let className =
    "font-bold mb-4 mt-8 first:mt-0 text-gray-900 dark:text-gray-100";
  if (level === 1) className = `text-2xl ${className}`;
  if (level === 2) className = `text-xl font-semibold mb-3 mt-6 ${className}`;
  if (level === 3) className = `text-lg font-medium mb-2 mt-5 ${className}`;

  return (
    <Tag
      className={`${className} ${hasArabic ? "font-arabic text-right" : ""}`}
      dir={hasArabic ? "rtl" : "ltr"}
    >
      {children}
    </Tag>
  );
};

export default CustomHeading;
