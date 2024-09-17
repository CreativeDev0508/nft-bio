'use client';
import { useEffect, useState } from "react";
// import Image from "next/image";
import { JsonRpcProvider, Contract, formatUnits, BrowserProvider, parseUnits } from "ethers";
import axios from 'axios';
import Web3Modal from 'web3modal';
import { marketplaceAddress } from "../../config";
import NFTBio from "../../artifacts/contracts/NFTBio.sol/NFTBio.json";

interface NFTItem {
  tokenId: number;
  seller: string;
  owner: string;
  price: string;
  image: string;
  name: string;
  description: string;

}

interface MarketItem {
  tokenId: bigint;
  price: bigint;
  seller: string;
  owner: string;
}

export default function Home() {
  const [nfts, setNfts] = useState<NFTItem[]>();
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadNFTs()
  }, []);

  async function loadNFTs() {
    const provider = new JsonRpcProvider();
    const contract = new Contract(marketplaceAddress, NFTBio.abi, provider);

    const data = await contract.fetchMarketItems();

    const items = await Promise.all(data.map(async (i: MarketItem) => {
      const tokenUri = await contract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      const price = formatUnits(i.price, 'ether');
      const item: NFTItem = {
        price,
        tokenId: Number(i.tokenId),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }

      return item;
    }));
    setNfts(items);
    setLoaded(true);
  }

  async function buyNFT(nft: NFTItem) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new BrowserProvider(connection);
    const signer = await provider.getSigner();

    const contract = new Contract(marketplaceAddress, NFTBio.abi, signer);

    const price = parseUnits(nft.price, 'ether');

    await contract.createMarketSale(nft.tokenId, { value: price });

    loadNFTs();
    console.log("signer:", signer);

  }
  if (loaded === true && !nfts?.length) return (
    <div className="flex justify-center items-center h-full">
      <p className="text-red-400 text-2xl text-center">No items in marketplace.</p>
    </div>
  )
  return (
    <div className="flex justify-center ">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts?.map((nft, i) => (
              <div key={i} className="border">
                <img src={nft.image} alt={nft.name} />
                {/* <Image
                  src={nft.image}
                  alt={nft.name}
                  width={500} // You should specify the width
                  height={500} // You should specify the height
                  layout="responsive" // Optional: for responsive behavior
                /> */}
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">
                    {nft.name}
                  </p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
