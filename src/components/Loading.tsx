import Image from "next/image";

const LoadingIcon: React.FC = () => {
  return (
    <Image height={25} width={25} src="spinner.svg" alt="Loading" />
  );
};

export default LoadingIcon;