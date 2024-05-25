import Image from "next/image";

const LoadingIcon: React.FC = () => {
  return (
      <Image height={30} width={30} src="spinner.svg" alt="Loading" />
  );
};

export default LoadingIcon;