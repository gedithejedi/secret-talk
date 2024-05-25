import Web3ModalProvider, { config } from "@/components/Web3ModalProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <Web3ModalProvider>
      <Component {...pageProps} />
    </Web3ModalProvider>
  );
}
