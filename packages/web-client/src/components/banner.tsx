import type { FunctionComponent, PropsWithChildren } from "react";

type Props = {
  type?: 'info' | 'warning'
}

export const Banner: FunctionComponent<PropsWithChildren<Props>> = ({ children, type }) => {
  const classes = [
    'm-4 p-6 shadow-md rounded-xl border',
    type === 'info'
      ? 'border-blue-200'
      : type === 'warning'
        ? 'border-orange-200'
        : 'border-gray-200'
  ]
  return (
    <div className={classes.join(' ')}>
      {children}
    </div>
  );
}