import React from "react";

import { getPlainText } from "../../utils/markdown";

const CustomParagraph = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const textContent = getPlainText(children);
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

  if (hasArabic && !hasLatin && textContent.trim().length > 10) {
    return (
      <p
        className="font-arabic mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-right"
        dir="rtl"
        {...props}
      >
        {children}
      </p>
    );
  }

  return (
    <p
      className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200"
      {...props}
    >
      {processChild(children, 0)}{" "}
    </p>
  );
};

export default CustomParagraph;

