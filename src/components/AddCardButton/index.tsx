import { FC } from "react";

type AddCardButtonProps = {
  onClick: () => void;
};

const AddCardButton: FC<AddCardButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full h-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer`}
    >
      +
    </button>
  );
};

export default AddCardButton;
