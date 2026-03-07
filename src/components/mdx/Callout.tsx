import type { ReactNode } from "react";

type CalloutProps = {
  type: "info" | "warning" | "error" | "success";
  children: ReactNode;
};

const typeClassMap: Record<CalloutProps["type"], string> = {
  info: "alert-info",
  warning: "alert-warning",
  error: "alert-error",
  success: "alert-success",
};

export default function Callout({ type, children }: CalloutProps) {
  return (
    <div role="alert" className={`alert ${typeClassMap[type]} my-4`}>
      <span>{children}</span>
    </div>
  );
}
