import { invoke } from "@tauri-apps/api/tauri";
import { useAccount } from "wagmi";
import Button from "@/components/Button";
import { config, publicClient } from "@/components/Web3ModalProvider";
import { signMessage } from '@wagmi/core'
import { useEffect, useState } from "react";
import GenerateBurnerWallet, { defaultBurnerAccount } from "@/components/GenerateBurner";
import RecipientAddress from "@/components/RecipientAddress";
import { isAddress } from "viem";

// interface ProgressEventPayload {
//   progress: number;
// }

// interface ProgressEventProps {
//   payload: ProgressEventPayload;
// }

// 0xa21d43d56f6b0790a8c44dd8bb71835650eedd5e

interface ConnectedToAccount {
  publicAddress: string;
  blockNumber: number;
  signedHash?: `0x${string}`;
}

export interface MyBurnerAccount {
  publicAddress: string;
  privateKey: string;
  // blockNumber: number;
}

export default function Home() {
  // const { address, isConnected, isDisconnected } = useAccount()
  const isConnected = true;
  const isDisconnected = false;
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [burnerAccount, setBurnerAccount] = useState<MyBurnerAccount>(defaultBurnerAccount);
  const [recipientAddress, setRecipientAddress] = useState<string>("" as `0x${string}`);
  const [hasConnected, setHasConnected] = useState<boolean>(false);

  // const verifyMessage = async (signature: `0x${string}`) => {
  //   if (!address) return false;
  //   console.log("burnerAccount", burnerAccount);
  //   console.log(`${burnerAccount.publicAddress}-${burnerAccount.blockNumber}`);

  //   return console.log(await publicClient.verifyMessage({
  //     address,
  //     message: `${burnerAccount.publicAddress}-${burnerAccount.blockNumber}`,
  //     signature,
  //   }));
  // }

  const connectToAddress = async (address: string) => {
    setIsSigning(true);
    console.log(address);

    try {
      const blockNumber = Number(await publicClient.getBlockNumber() || 0);
      // const res = await signMessage(config, { message: `${recipientAddress}-${blockNumber}` });

      const { appWindow } = await import("@tauri-apps/api/window");
      await invoke("start", {
        window: appWindow,
      });

      console.log(`${recipientAddress}-${blockNumber}`);
      setTimeout(() => {
        setHasConnected(true)
      }, 1000);
    } catch (e) {
      console.log(e);
      setBurnerAccount(defaultBurnerAccount);
    } finally {
      setIsSigning(false);
    }
  }

  const terminateConnection = async () => {
    try {
      setIsSigning(true);

      const { appWindow } = await import("@tauri-apps/api/window");
      await invoke("stop", {
        window: appWindow,
      });

      setTimeout(() => {
        setHasConnected(false);
      }, 1000);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSigning(false);
    }
  }

  useEffect(() => {
    if (isDisconnected && isSigning) setIsSigning(false);
    if (isDisconnected && burnerAccount.publicAddress) setBurnerAccount(defaultBurnerAccount);
  }, [isConnected, isDisconnected, isSigning]);
  console.log(hasConnected);
  return (
    <div className="bg-slate-800 min-h-screen	pb-9">
      <div className="flex justify-end px-2 pt-2">
        <w3m-button />
      </div>

      <div className="p-3 flex flex-col justify-center items-center">
        <div className="text-center text-2xl text-white mt-4 mb-4">Welcome to Secret Talk</div>
        {isConnected ? (
          <GenerateBurnerWallet
            setIsSigning={setIsSigning}
            setBurnerAccount={setBurnerAccount}
            burnerAccount={burnerAccount}
            isSigning={isSigning}
          />
        ) :
          <p>You are logged out. Please log in to use the app.</p>}

        {burnerAccount.publicAddress && (
          <div className="flex flex-col justify-start w-full bg-slate-700 p-5 mt-10 max-w-[500px] rounded-md">
            {hasConnected && <div className="w-full flex justify-end">
              <div className="flex gap-1 justify-center items-center bg-green-500 p-1 rounded-full w-32">
                <div className="bg-green-800 rounded-full h-2 w-2" />Connected
              </div>
            </div>}
            <div className="flex flex-col text-white mt-4 mb-2">
              <label className="mb-1" htmlFor="privateKey">My public Address:</label>
              <input id="privateKey" type="text" className="bg-slate-600 rounded p-1 w-full" value={burnerAccount.publicAddress} readOnly />
            </div>
            {/* <div className="flex flex-col text-white mt-4 mb-2">
              <label className="mb-1" htmlFor="privateKey">Private Key:</label>
              <input id="privateKey" type="text" className="bg-slate-500 rounded border-1 border-black p-1 w-full" value={burnerAccount.privateKey} readOnly />
            </div>
            <div className="flex flex-col text-white mt-4 mb-4">
              <label className="mb-1" htmlFor="hash">Signed Hash: </label>
              <input id="hash" type="text" className="bg-slate-500 rounded border-1 border-black p-1 w-full" value={burnerAccount.signedHash} readOnly />
            </div> */}

            {/* <Button onClick={() => verifyMessage(burnerAccount.signedHash)}>Verify</Button> */}

            <RecipientAddress
              setRecipientAddress={setRecipientAddress}
              recipientAddress={recipientAddress}
              connectToAddress={!hasConnected ? connectToAddress : terminateConnection}
              isLoading={isSigning}
            />
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