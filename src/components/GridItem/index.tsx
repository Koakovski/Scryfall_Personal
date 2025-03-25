import { FC, PropsWithChildren } from "react";

const GridItem: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={`aspect-[72/100] rounded-lg overflow-hidden flex items-center justify-center`}
    >
      {children}
    </div>
  );
};

export default GridItem;
