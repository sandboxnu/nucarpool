import React from "react";

export const SetupContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`z-50 h-[500px] w-[600px] bg-white p-4 ${className}`}>
      {children}
    </div>
  );
};
