import { invoke } from "@tauri-apps/api/tauri";
import { useAccount } from "wagmi";
import Button from "@/components/Button";
import { config, publicClient } from "@/components/Web3ModalProvider";
import { useEffect, useState } from "react";
import GenerateBurnerWallet, { defaultBurnerAccount } from "@/components/GenerateBurner";
import RecipientAddress from "@/components/RecipientAddress";
import { isAddress } from "viem";
import Image from "next/image";
import { copyToClipboard } from "@/utils/copy";

// interface ProgressEventPayload {
//   progress: number;
// }

// interface ProgressEventProps {
//   payload: ProgressEventPayload;
// }

interface ConnectedToAccount {
  publicAddress: string;
  blockNumber: number;
  signedHash?: `0x${string}`;
}

export interface MyBurnerAccount {
  publicAddress: string;
  privateKey: string;
}

export default function Home() {
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [burnerAccount, setBurnerAccount] = useState<MyBurnerAccount>(defaultBurnerAccount);
  const [recipientAddress, setRecipientAddress] = useState<string>("" as `0x${string}`);
  const [hasConnected, setHasConnected] = useState<boolean>(false);
  const [action, setAction] = useState<"sender" | "receiver">("sender");

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
        emission: action === "receiver" ? false : true,
      });

      console.log(`${recipientAddress}-${blockNumber}`);
      setHasConnected(true)
    } catch (e) {
      console.log(e);
      setBurnerAccount(defaultBurnerAccount);
    } finally {
      setTimeout(() => {
        setIsSigning(false);
      }, 1000);
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
      setTimeout(() => {
        setIsSigning(false);
      }, 1000);
    }
  }

  console.log(action);
  return (
    <div className="bg-[#1e2229] min-h-screen flex items-center flex-col justify-center w-full">
      <div className="w-full flex justify-end fixed top-0 left-0 p-4">
        {hasConnected ? <div className="w-full flex justify-between">
          <div className="flex gap-1 justify-center items-center bg-green-500 px-2 rounded-full w-auto">
            <div className="bg-green-800 rounded-full h-2 w-2" />Secure network established
          </div>
        </div> :
          <div className="w-full flex justify-end">
            <div className="flex gap-1 justify-center items-center bg-red-500 px-2 rounded-full w-auto">
              <div className="bg-red-800 rounded-full h-2 w-2" />Unsecure network
            </div>
          </div>
        }
      </div>

      <div className="p-3 flex flex-col justify-center items-center">
        <GenerateBurnerWallet
          setIsSigning={setIsSigning}
          setBurnerAccount={setBurnerAccount}
          burnerAccount={burnerAccount}
          isSigning={isSigning}
        />

        {burnerAccount.publicAddress && (
          <div className="flex flex-col justify-start w-full p-5 mt-8 min-w-[530px] max-w-[550px] rounded-md">
            <div className="flex justify-center">
              <Image height={60} width={60} src="secure.svg" alt="logo" />
            </div>
            <div className="text-center text-2xl text-white mt-4 mb-2">Welcome to Secret Talk</div>
            <p className="max-w-[550px] mb-6">
              Establish a fully encrypted connection to another ETH address. Use this on any voice or video call application and only the recipient will be able to hear you!
            </p>

            <div className="flex flex-col text-white mt-4">
              <label className="mb-1" htmlFor="privateKey">My address</label>
              <div className="flex bg-slate-500 rounded p-[8px]">
                <input id="privateKey" type="text" className="bg-transparent w-full" value={burnerAccount.publicAddress} readOnly />
                <Image className="cursor-pointer" height={20} width={20} src="/copy.svg" alt="copy" onClick={() => copyToClipboard(burnerAccount.publicAddress)} />
              </div>
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
              hasConnected={hasConnected}
            />
          </div>
        )}

        <fieldset className="flex gap-4" onChange={(e) => setAction((e.target as HTMLInputElement).value as any)}>
          <div>
            <input type="radio" id="sender" name="action" value="sender" />
            <label className="ml-1" htmlFor="sender">Sender</label>
          </div>

          <div>
            <input type="radio" id="receiver" name="action" value="receiver" />
            <label className="ml-1" htmlFor="receiver">Receiver</label>
          </div>
        </fieldset>
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