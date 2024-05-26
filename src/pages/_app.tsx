import Web3ModalProvider, { config } from "@/components/Web3ModalProvider";
import "@/styles/globals.css";
import { invoke } from "@tauri-apps/api/tauri";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  
  const start = async () => {
    const { appWindow } = await import("@tauri-apps/api/window");
    await invoke("start", {
      window: appWindow,
      emission: false,
    });
  }

  useEffect(() => {
    start();
  }, []);

  return (
    <Web3ModalProvider>
      <Component {...pageProps} />
    </Web3ModalProvider>
  );
}
