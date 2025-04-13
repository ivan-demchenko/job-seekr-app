import type { FunctionComponent, PropsWithChildren } from "react";

type Props = {
  type?: "info" | "warning" | "error";
};

export const Banner: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  type,
}) => {
  const classes = [
    "m-4 p-6 shadow-md rounded-xl border",
    type === "info"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : type === "warning"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : type === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-gray-200 bg-gray-50 text-gray-800",
  ];
  return <div className={classes.join(" ")}>{children}</div>;
};
