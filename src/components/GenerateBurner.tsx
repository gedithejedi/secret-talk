import { MyBurnerAccount } from "@/pages";
import Button from "./Button";
import LoadingIcon from "./Loading";
import { publicClient } from "@/components/Web3ModalProvider";
import Wallet from "ethereumjs-wallet"

export const defaultBurnerAccount = {
  publicAddress: "",
  privateKey: "",
}

interface GenerateBurnerWalletProps {
  setIsSigning: (isSigning: boolean) => void;
  setBurnerAccount: (burnerAccount: MyBurnerAccount) => void;
  isSigning: boolean;
  burnerAccount: MyBurnerAccount;
}

const GenerateBurnerWallet = ({ setIsSigning, setBurnerAccount, isSigning, burnerAccount }: GenerateBurnerWalletProps) => {
  const generateWalletButtonText = burnerAccount.publicAddress ? "Generate another address" : "Generate an address";

  const generateBurner = async () => {
    setIsSigning(true);
    const wallet = Wallet.generate();
    const publicAddress = `0x${wallet.getAddress().toString('hex')}`;
    const privateKey = `0x${wallet.getPrivateKey().toString('hex')}`;

    try {
      const blockNumber = Number(await publicClient.getBlockNumber() || 0);

      setBurnerAccount({
        publicAddress,
        privateKey,
      });

    } catch (e) {
      console.log(e);
      setBurnerAccount(defaultBurnerAccount);
    } finally {
      setIsSigning(false);
    }
  }


  return (
    <div className="max-w-96" >
      <Button isLoading={isSigning} onClick={generateBurner}>
        {isSigning && <LoadingIcon />}
        <p className="ml-1">{isSigning ? "Generating address.." : generateWalletButtonText}</p>
      </Button>
    </div >
  )
}

export default GenerateBurnerWallet;