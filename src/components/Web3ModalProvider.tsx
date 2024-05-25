import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { State, WagmiProvider, cookieStorage, createStorage } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createPublicClient, http } from 'viem'
import { ReactNode } from 'react'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID 

if (!projectId) {
  throw new Error('Missing projectId')
}

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = defaultWagmiConfig({
  chains: [sepolia],
  projectId,
  metadata,
  storage: createStorage({
    storage: cookieStorage
  }),
})

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

createWeb3Modal({
  wagmiConfig: config,
  themeMode: 'dark',
  projectId,
})

export default function Web3ModalProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <WagmiProvider config={config} >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}