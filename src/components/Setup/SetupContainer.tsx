import React from "react";
import { CSSProperties } from "styled-components";

export const SetupContainer = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <div
      className={`z-50 h-[500px] w-[600px] bg-white p-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
