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
  const pxByColsMap = {
    "4": "20",
    "6": "10",
    "8": "5",
  };

  return (
    <div
      className={`grid ${colClasses[gridCols]} gap-2 px-${pxByColsMap[gridCols]}`}
    >
      {children}
    </div>
  );
};

export default Grid;
