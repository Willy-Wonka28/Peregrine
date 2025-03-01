import WalletConnectButton from "./components/WalletConnectButton";

function App() {
  
  return (

    <div  className="bg-cover bg-center h-[100vh] w-full flex items-center p-6 justify-around flex-col"
          style={{backgroundImage: "url('/images/Peregrine.png')"}}>
      <WalletConnectButton />
    </div>

  );
}

export default App;