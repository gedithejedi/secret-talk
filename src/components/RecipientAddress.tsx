import Button from "./Button";
import { isAddress } from "viem";

interface RecipientAddressProps {
  setRecipientAddress: (recipientAddress: string) => void;
  recipientAddress: string;
  connectToAddress: (address: string) => void;
  isLoading?: boolean;
  hasConnected: boolean;
  disabled?: boolean;
}

const RecipientAddress = ({ setRecipientAddress, recipientAddress, connectToAddress, isLoading, hasConnected, disabled }: RecipientAddressProps) => {

  return (
    <div className="mt-6">
      <p className="mb-1">Connect to*</p>
      <input
        type="text"
        className="bg-slate-500 rounded border-1 border-black p-[7px] w-full mb-6"
        value={recipientAddress}
        placeholder="0x.."
        onChange={(e) => setRecipientAddress(e.target.value)}
      />
      <Button
        disabled={disabled}
        isLoading={isLoading}
        className={hasConnected ? "bg-red-400 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-700"}
        onClick={() => {
          if (!isAddress(recipientAddress)) return console.error("Invalid address");
          connectToAddress(recipientAddress)
        }}
      >
        {isLoading ? "Please wait.." : hasConnected ? "Terminate private connection" : "Start a private connection"}
      </Button>
    </div>
  )
}

export default RecipientAddress;