import { useAccount } from "wagmi";
import Button from "@/components/Button";
import Wallet from "ethereumjs-wallet"
import { config, publicClient } from "@/components/Web3ModalProvider";
import { signMessage } from '@wagmi/core'
import { useState } from "react";
import LoadingIcon from "@/components/Loading";

interface ProgressEventPayload {
  progress: number;
}

interface ProgressEventProps {
  payload: ProgressEventPayload;
}

export default function Home() {
  const {address} = useAccount();
  const [isSigning, setIsSigning] = useState<boolean>(false);

  // const [busy, setBusy] = useState<boolean>(false);

  // useEffect(() => {
  //   // listen what can Rust part tell us about
  //   const unListen = listen("PROGRESS", (e: ProgressEventProps) => {
  //     console.log(e.payload.progress);
  //   });

  //   return () => {
  //     unListen.then((f) => f());
  //   };
  // }, []);

  const generateBurnerAndSign = async () => {  
    setIsSigning(true);
    const wallet = Wallet.generate();
    const publicAddress = `0x${wallet.getAddress().toString('hex')}`;
    const privateKey = `0x${wallet.getPrivateKey().toString('hex')}`;

    const blockNumber = await publicClient.getBlockNumber();
   
    try{
      const res = await signMessage(config, { message: `${publicAddress}-${blockNumber}` })
      console.log(res);
    }catch(e){
      console.log(e);
    }finally{
      setIsSigning(false);
    }
  }

console.log(address);
  return (
    <div className="bg-slate-800 h-screen	">
      <div className="flex justify-end px-2 pt-2">
        <w3m-button />
      </div>

      <div className="p-3 flex flex-col justify-center items-center">
        <div className="text-center text-2xl text-white mt-4 mb-4">Welcome to Secret Talk</div>
        <Button isLoading={isSigning} onClick={generateBurnerAndSign}>
          {isSigning && <LoadingIcon />}
          <p className="ml-1">{isSigning ? "Awaiting signature" : "Generate wallet"}</p>
        </Button>
      </div>
      {/* {!busy && (
        <button
          onClick={() => {
            setBusy(true);
            setTimeout(async () => {
              const { appWindow } = await import("@tauri-apps/api/window");
              // call Rust function, pass the window
              await invoke("progress_tracker", {
                window: appWindow,
              });
              setBusy(false);
            }, 1000);
          }}
        >
          Start Progress
        </button>
      )} */}
    </div>
  );
}