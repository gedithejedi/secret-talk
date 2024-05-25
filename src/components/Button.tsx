import classNames from "classnames";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, isLoading }) => {
  return (
    <button
      className={classNames("bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-md",{
        "cursor-not-allowed bg-gray-500 hover:bg-gray-500 flex items-center": isLoading,
      })}
      onClick={onClick}
      disabled={isLoading}
    >
      {children}
    </button>
  );
};

export default Button;