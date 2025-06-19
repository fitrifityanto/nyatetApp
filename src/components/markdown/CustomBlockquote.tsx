
import React from "react";
import { getPlainText } from "../../utils/markdown";


interface CustomBlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  children?: React.ReactNode; 
}

const CustomBlockquote = ({ children, ...props }: CustomBlockquoteProps) => {
 
  const textContent = getPlainText(children) || ''; 
  const hasArabic =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      textContent,
    );
  const hasLatin = /[A-Za-z]/.test(textContent);

  const processChild = (
    child: React.ReactNode,
    index: number,
  ): React.ReactNode => {
    if (typeof child === "string") {
      const parts = child.split(
        /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]{4,})/,
      );

      return parts.map((part, i) => {
        const isArabic =
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
            part,
          );
        
        const uniqueKey = `${part}-${i.toString()}-${index.toString()}`;
        return isArabic ? (
          <span key={uniqueKey} dir="rtl" className="font-arabic">
            {part}
          </span>
        ) : (
          <React.Fragment key={uniqueKey}>{part}</React.Fragment>
        );
      });
    } else if (Array.isArray(child)) {
      return (child as React.ReactNode[]).map((item, i) =>
        processChild(item, i),
      );
    } else if (React.isValidElement(child)) {
      interface ChildElementProps {
        children?: React.ReactNode;
        [key: string]: unknown;
      }
      const typedChildProps = child.props as ChildElementProps;
      const newProps = {
        ...typedChildProps,
        key: child.key ?? `element-${index.toString()}`,
      };
      const childrenToProcess = typedChildProps.children;

      return React.createElement(
        child.type,
        newProps,
        childrenToProcess !== undefined && childrenToProcess !== null
          ? processChild(childrenToProcess, 0)
          : undefined,
      );
    }
    return child;
  };

  // Terapkan gaya blockquote dasar
  const baseClasses = `border-l-4 border-gray-300 dark:border-gray-600 pl-6 my-6 text-gray-700 dark:text-gray-300 italic`;
  let finalClasses = baseClasses;
  let direction = "ltr";

  // Jika teks Arab mendominasi dan cukup panjang, anggap sebagai paragraf Arab penuh
  if (hasArabic && !hasLatin && textContent.trim().length > 10) {
    finalClasses += " font-arabic text-right border-r-4 border-l-0 pr-6 pl-0";
    direction = "rtl";
    return (
      <blockquote className={finalClasses} dir={direction} {...props}>
        {children} 
      </blockquote>
    );
  }

  // Jika campuran atau dominan Latin, proses secara inline
  return (
    <blockquote className={finalClasses} dir={direction} {...props}>
      {processChild(children, 0)}
    </blockquote>
  );
};

export default CustomBlockquote;