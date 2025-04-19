import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  fluid = false,
}) => {
  return (
    <div
      className={cn(
        fluid ? "w-full" : "container mx-auto px-4",
        className
      )}
    >
      {children}
    </div>
  );
}; 