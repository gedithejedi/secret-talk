import classNames from "classnames";
import LoadingIcon from "./Loading";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, isLoading, disabled, className }) => {

  return (
    <button
      className={classNames("w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md", className, {
        "cursor-not-allowed bg-gray-500 hover:bg-gray-500 flex items-center justify-center": isLoading,
      })}
      onClick={onClick}
      disabled={isLoading || disabled}
    >
      {isLoading && <LoadingIcon />}
      {children}
    </button>
  );
};

export default Button;