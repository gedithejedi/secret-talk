import { MyBurnerAccount } from "@/pages";
import Button from "./Button";
import LoadingIcon from "./Loading";
import { publicClient } from "@/components/Web3ModalProvider";
import Wallet from "ethereumjs-wallet"
import { isAddress } from "viem";

interface RecipientAddressProps {
  setRecipientAddress: (recipientAddress: string) => void;
  recipientAddress: string;
  connectToAddress: (address: string) => void;
  isLoading?: boolean;
}

const RecipientAddress = ({ setRecipientAddress, recipientAddress, connectToAddress, isLoading }: RecipientAddressProps) => {

  return (
    <div className="mt-6">
      <p className="mb-1">I will be talking to:</p>
      <input
        type="text"
        className="bg-slate-500 rounded border-1 border-black p-1 w-full mb-3"
        value={recipientAddress}
        placeholder="0x.."
        onChange={(e) => setRecipientAddress(e.target.value)}
      />
      <Button
        isLoading={isLoading}
        onClick={() => {
          if (!isAddress(recipientAddress)) return console.error("Invalid address");
          connectToAddress(recipientAddress)
        }}
      >
        {isLoading ? "Please wait.." : "Start a private conversation"}
      </Button>
    </div>
  )
}

export default RecipientAddress;