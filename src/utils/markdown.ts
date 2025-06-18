import React from "react";

export const getPlainText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getPlainText).join("");
  }
  if (React.isValidElement(node)) {
    const elementProps = node.props as { children?: React.ReactNode };
    if (elementProps.children !== undefined) {
      return getPlainText(elementProps.children);
    }
  }
  return "";
};
