'use client'
import { useEffect, useState } from "react";
import Web3 from "web3";
import buyEarthAbi from './abis/buyEarthAbi.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const contractABI = buyEarthAbi;
  // const contractAddress = "0x014F49968F6C6d5Ecc507aFe14771385e8c8bB85";
  const contractAddress = "0x57dEa92D2270D038b983B7FCF4301036d63eB245";
  const [squares, setSquares] = useState<Number[]>([])
  const [selectedColor, setSelectedColor] = useState(0)
  const [web3, setWeb3] = useState<Web3 | null>(null)

  useEffect(() => {
    console.log('window', window)
    if (typeof window !== 'undefined' && window.ethereum) {
      const tempWeb3 = new Web3(window.ethereum)
      getSquaresData(tempWeb3);
      setWeb3(tempWeb3)

      // 事件监听
      const contract = new tempWeb3.eth.Contract(contractABI, contractAddress);
      const handleBuySquare = (buyer: string, idx: string, color: string) => {
        // 事件参数为 string，需要转为 number
        getSquaresData(tempWeb3);
      };
      contract.events.BuySquare({})
        .on('data', (event: any) => {
          const { buyer, idx, color } = event.returnValues;
          handleBuySquare(buyer, idx, color);
        })
        // .on('error', (error: any) => {
        //   console.error('BuySquare event error:', error);
        // });

      // 清理函数，组件卸载时移除监听
      return () => {
        // contract.removeAllListeners('BuySquare');
        contract.removeAllListeners();
      };
    }
  }, [])

  async function getSquaresData(web3: Web3) {
    try {
      console.log('ABI:', contractABI);
      if (!web3) return;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log('Contract methods:', contract.methods);
      const squares = await contract.methods.getSquares().call();
      console.log("Squares data:", squares);
      setSquares(squares || [])
    } catch (error) {
      console.error("Error fetching squares:", error);
    }
  }

  const buySquare = async (idx: number) => {
    // const color = Math.floor(Math.random() * 16777215); // Random hex color
    const color = selectedColor;
    try {
      if (!web3) {
        alert('请安装 MetaMask!');
        return;
      }

      // 请求用户连接 MetaMask
      await web3.eth.requestAccounts();

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();
      const tx = await contract.methods.buySquare(idx, color).send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether')
      });
      console.log('tx', tx)
      await getSquaresData(web3);
    } catch (error) {
      console.error("Error buying square:", error);
    }
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium">选择颜色</h3>
          <div className="grid grid-cols-10 gap-2">
            {[
              '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00',
              '#9ACD32', '#008000', '#20B2AA', '#87CEEB', '#0000FF',
              '#4B0082', '#800080', '#FF69B4', '#FF1493', '#8B4513',
              '#A0522D', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
              '#FFFFFF', '#F5F5F5', '#DCDCDC', '#A9A9A9', '#808080'
            ].map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  const colorNum = parseInt(color.substring(1), 16);
                  console.log('colorNum', colorNum)
                  setSelectedColor(colorNum);
                }}
              />
            ))}
          </div>
          <div className="mt-2">
            已选颜色:
            <div
              className="inline-block w-6 h-6 ml-2 border border-gray-200 rounded-full"
              style={{ backgroundColor: selectedColor ? `#${selectedColor.toString(16).padStart(6, '0')}` : '#fff' }}
            />
          </div>
        </div>
        <div className="grid grid-cols-10 gap-0">
          {squares.map((_, i) => (
            <div
              key={i}
              className="w-[50px] h-[50px] border border-[#ccc] cursor-pointer"
              style={{ backgroundColor: squares[i] ? `#${squares[i].toString(16).padStart(6, '0')}` : '#fff' }}
              onClick={() => buySquare(i)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
