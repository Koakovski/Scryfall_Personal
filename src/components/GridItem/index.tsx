import { FC, PropsWithChildren } from "react";

const GridItem: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={`rounded-lg overflow-hidden flex items-center justify-center cursor-pointer`}
    >
      {children}
    </div>
  );
};

export default GridItem;
