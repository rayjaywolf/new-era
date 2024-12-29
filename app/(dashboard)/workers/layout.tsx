import React from "react";

export default function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-8">
      <div className="flex-1">{children}</div>
    </div>
  );
}
