import { FC } from "react";

type AddCardButtonProps = {
  onClick: () => void;
};

const AddCardButton: FC<AddCardButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-dashed border-slate-600 
                 text-slate-400 rounded-lg hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 
                 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
      <span className="text-xs font-medium">Adicionar Carta</span>
    </button>
  );
};

export default AddCardButton;
