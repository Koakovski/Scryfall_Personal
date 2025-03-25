import { FC } from "react";

const AddCardButton: FC = () => {
  return (
    <button
      className={`w-full h-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer`}
    >
      +
    </button>
  );
};

export default AddCardButton;
