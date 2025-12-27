import { FC, PropsWithChildren } from "react";

type GridProps = PropsWithChildren<{
  gridCols: "4" | "6" | "8";
}>;

const colClasses = {
  "4": "grid-cols-4",
  "6": "grid-cols-6",
  "8": "grid-cols-8",
};

const Grid: FC<GridProps> = ({ children, gridCols }) => {
  return (
    <div className={`grid ${colClasses[gridCols]} gap-2 px-20`}>{children}</div>
  );
};

export default Grid;
