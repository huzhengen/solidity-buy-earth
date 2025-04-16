'use client'
import Image from "next/image";
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
  const contractAddress = "0x014F49968F6C6d5Ecc507aFe14771385e8c8bB85"; // Replace with actual address
  const [squares, setSquares] = useState<Number[]>([])
  const [selectedColor, setSelectedColor] = useState(0)

  async function getSquaresData() {
    try {
      const web3 = new Web3("http://localhost:8545");
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const squares = await contract.methods.getSquares().call();
      console.log("Squares data:", squares);
      setSquares(squares || [])
    } catch (error) {
      console.error("Error fetching squares:", error);
    }
  }

  useEffect(() => {
    getSquaresData();
  }, []);

  const buySquare = async (idx: number) => {
    // const color = Math.floor(Math.random() * 16777215); // Random hex color
    const color = selectedColor;
    try {
      // const web3 = new Web3("http://localhost:8545");
      // const contract = new web3.eth.Contract(contractABI, contractAddress);
      // const accounts = await web3.eth.getAccounts();
      // console.log('accounts', accounts)
      // console.log('contract', contract)
      if (!window.ethereum) {
        alert('请安装 MetaMask!');
        return;
      }

      // 请求用户连接 MetaMask
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // 使用 MetaMask 提供的 provider
      const web3 = new Web3(window.ethereum);
      // const web3 = new Web3("http://localhost:8545");

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();
      const tx = await contract.methods.buySquare(idx, color).send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether')
      });
      console.log('tx', tx)
      await getSquaresData();
    } catch (error) {
      console.error("Error buying square:", error);
    }
  }

  return (
    <div className="min-h-screen gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
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
