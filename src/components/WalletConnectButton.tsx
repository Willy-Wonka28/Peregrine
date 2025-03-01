//react hook to help with slow asynchronous functions
import { useMemo } from 'react';
//these two modules help with connecting the wallet to the right network while the second one helps in providing a lis of wallets you can use to interact with these networks
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
//this prolly brings us in contact with the three networks
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
//ui components
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
//this returns the ui for a solana cluster either testnet, devnet or mainnet
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import SwappingWidget from './SwappingWidget';



function WalletConnectButton(): React.ReactNode {

  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
      () => [
          new UnsafeBurnerWalletAdapter(),
      ],
      [network]
  );

  return (
      <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <div className='bg-[#111B40] p-2 rounded-2xl flex justify-between shadow-lg w-[80vw]'>
            <div className='flex justify-center items-center'>
                <h1 className='text-3xl font-bold text-white'>Peregrine</h1>
            </div>
            <div className='flex gap-2'>
                <WalletModalProvider>
                  <WalletMultiButton />
                  <WalletDisconnectButton />
              </WalletModalProvider></div>
            </div>
              <SwappingWidget />
          </WalletProvider>
      </ConnectionProvider>
  );
}

export default WalletConnectButton


