//importing libraries for setup coonnection
import { Connection, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch'
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react'

function SwappingWidget() {

     //setting up user wallet
     const wallet = useWallet();


    //for now it's a one way swap from solana to usdc as such we would only need to get the state for the amount of solana the user is willing to swap
    const[amount, setAmount] = useState<number | null>(null)

    //this captures the state for the value of the token we intend to swap to
    const[value, setValue] = useState<number | null>(null)

    //we using the useEffect hook to get real time value of the token we need to swap to without waiting for the user to click on the swap button

    const fetchQuote = async () => {
        const priceResponse = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112')

        const priceData = await priceResponse.json();

        console.log(`Price response displayed in fronted`)
        const output = amount ? amount * priceData.data.So11111111111111111111111111111111111111112.price : 0;
        setValue(output ?? 0) 
      };
      
      useEffect(() => {
        fetchQuote();
      }, [amount]);

    //getting the route for a swap
    async function signAndSend(){

            //RPC endpoint for solana cluster e.g mainnet, testnet or devnet
            const connection = new Connection('https://api.mainnet-beta.solana.com');
            if (amount !== null){
                const quoteResponse = await (
                    await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${amount*LAMPORTS_PER_SOL}&slippageBps=50`
                    )
                ).json();
                console.log({ quoteResponse })
            

            if (wallet.publicKey){
                //get the serialized transactions to perform the swap
                const { swapTransaction } = await (
                    await fetch('https://quote-api.jup.ag/v6/swap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        // quoteResponse from /quote api
                        quoteResponse: quoteResponse ?? {},
                        // user public key to be used for the swap
                        userPublicKey: wallet.publicKey.toString(),
                        // auto wrap and unwrap SOL. default is true
                        wrapAndUnwrapSol: true,
                        // Optional, use if you want to charge a fee.  feeBps must have been passed in /quote API.
                        // feeAccount: "fee_account_public_key"
                    })
                    })
                ).json();

            //deserialize and sign the transaction
            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
            console.log(transaction);

            if (!wallet.signTransaction) {
                console.error("Wallet is not connected or does not support signing transactions.");
                return;
            }            

            // sign the transaction
            const signedTransaction = await wallet?.signTransaction(transaction);

            //warning message
            if(signedTransaction == null){
                console.warn("Please ensure your wallet is connected.")
            }

            // get the latest block hash
            const latestBlockHash = await connection.getLatestBlockhash();

            // Execute the transaction
            const rawTransaction = transaction.serialize();
            const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2
            });
            await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid
            });
            console.log(`https://solscan.io/tx/${txid}`);
            }else{
                console.warn("Your wallet might not be connected")
            }

        }
           
    }

    return (
        <div>
        <div className="flex justify-center items-center p-4">
        <div className="bg-[#111B40] p-6 rounded-2xl shadow-lg w-full max-w-sm md:max-w-md lg:max-w-lg">
            <div className="mb-4">
            <label className="text-gray-400 text-sm">Swap:</label>
            <div className="flex justify-between items-center bg-[#0D1435] p-3 rounded-lg mt-1">
                <input
                type="number"
                placeholder="0"
                value={amount ?? 0}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="bg-transparent text-white text-xl w-full outline-none"
                />
                <span className="text-white font-bold flex items-center gap-2 mx-3">
                <img
                    src="/images/solana.png"
                    alt="SOL"
                    className="w-5 h-5"
                />
                SOL
                </span>
            </div>
            </div>

            <div className="mb-4">
            <label className="text-gray-400 text-sm">To:</label>
            <div className="flex justify-between items-center bg-[#0D1435] p-3 rounded-lg mt-1">
                <input
                type="number"
                placeholder="0"
                value={value !== null ? value?.toFixed(3).toString() : "0"}
                className="cursor-pointer bg-transparent text-white text-xl w-full outline-none"
                />
                <span className="text-white font-bold flex items-center gap-2 mx-3">
                <img
                    src="/images/usd-coin.png"
                    alt="USDC"
                    className="w-5 h-5"
                />
                USDC
                </span>
            </div>
            </div>
            <button onClick={()=>{signAndSend()}} className=" text-white bg-gradient-to-r from-[#6D28D9] to-[#3B82F6] w-full py-3 rounded-lg font-semibold mt-4">
            Swap
            </button>
            <div className='my-5 text-gray-400 text-sm underline flex justify-center items-center'>
                All transactions have a slippage of 0.5%
            </div>
        </div>
        </div>
        </div>
    )

    
}

export default SwappingWidget


 