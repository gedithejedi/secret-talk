import { useAccount } from "wagmi";
import Button from "@/components/Button";
import Wallet from "ethereumjs-wallet"
import { config, publicClient } from "@/components/Web3ModalProvider";
import { signMessage } from '@wagmi/core'
import { useEffect, useState } from "react";
import LoadingIcon from "@/components/Loading";

// interface ProgressEventPayload {
//   progress: number;
// }

// interface ProgressEventProps {
//   payload: ProgressEventPayload;
// }

const defaultBurnerAccount = {
  publicAddress: "",
  privateKey: "",
  blockNumber: 0,
  signedHash: "0x" as `0x${string}`
}

export default function Home() {
  const { address, isConnected, isDisconnected } = useAccount()
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [burnerAccount, setBurnerAccount] = useState(defaultBurnerAccount);
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
    
    try{
      const blockNumber = Number(await publicClient.getBlockNumber() || 0);
      const res = await signMessage(config, { message: `${publicAddress}-${blockNumber}` });
      
      setBurnerAccount({
        publicAddress,
        privateKey,
        blockNumber,
        signedHash: res
      });
      console.log(`${publicAddress}-${blockNumber}`);

    }catch(e){
      console.log(e);
      setBurnerAccount(defaultBurnerAccount);
    }finally{
      setIsSigning(false);
    }
  }

  const verifyMessage = async (signature: `0x${string}`) => {
    if(!address) return false;
    console.log("burnerAccount" ,burnerAccount);
    console.log(`${burnerAccount.publicAddress}-${burnerAccount.blockNumber}`);

    return console.log(await publicClient.verifyMessage({
      address,
      message: `${burnerAccount.publicAddress}-${burnerAccount.blockNumber}`,
      signature,
    }));
  }

  useEffect(() => {
    if(isDisconnected && isSigning) setIsSigning(false);
    if(isDisconnected && burnerAccount.publicAddress) setBurnerAccount(defaultBurnerAccount);
  },[isConnected, isDisconnected, isSigning]);
  
  console.log(isConnected);
  console.log(burnerAccount);

  return (
    <div className="bg-slate-800 min-h-screen	pb-9">
      <div className="flex justify-end px-2 pt-2">
        <w3m-button />
      </div>

      <div className="p-3 flex flex-col justify-center items-center">
        <div className="text-center text-2xl text-white mt-4 mb-4">Welcome to Secret Talk</div>
        {isConnected ? (
          <Button isLoading={isSigning} onClick={generateBurnerAndSign}>
            {isSigning && <LoadingIcon />}
            <p className="ml-1">{isSigning ? "Awaiting signature" : "Generate wallet"}</p>
          </Button>
        ) : 
        <p>You are logged out. Please log in to use the app.</p>}

        {burnerAccount.publicAddress && (
          <div className="flex flex-col justify-start w-full bg-slate-700 p-5 mt-10 max-w-[500px] rounded-md">
            <div className="w-full flex justify-end">
              <div className="flex gap-1 justify-center items-center bg-green-500 p-1 rounded-full w-32">
                <div className="bg-green-800 rounded-full h-2 w-2"/>Connected
              </div>
            </div>
            <div className="flex flex-col text-white mt-4 mb-2">
              <label className="mb-1" htmlFor="privateKey">Public Address:</label>
              <input id="privateKey" type="text" className="bg-slate-500 rounded border-1 border-black p-1 w-full" value={burnerAccount.publicAddress} readOnly/>
            </div>
            <div className="flex flex-col text-white mt-4 mb-2">
              <label className="mb-1" htmlFor="privateKey">Private Key:</label>
              <input id="privateKey" type="text" className="bg-slate-500 rounded border-1 border-black p-1 w-full" value={burnerAccount.privateKey} readOnly/>
            </div>
            <div className="flex flex-col text-white mt-4 mb-4">
              <label className="mb-1" htmlFor="hash">Signed Hash: </label>
              <input id="hash" type="text" className="bg-slate-500 rounded border-1 border-black p-1 w-full" value={burnerAccount.signedHash} readOnly/>
            </div>

            <Button onClick={() => verifyMessage(burnerAccount.signedHash)}>Verify</Button>
          </div> 
        )}
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