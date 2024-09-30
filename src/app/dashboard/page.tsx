"use client";

import { useEffect, useState } from 'react';
import axios from "axios";
import NFTBio from "../../../artifacts/contracts/NFTBio.sol/NFTBio.json";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { marketplaceAddress } from '../../../config';
import Web3Modal from 'web3modal';
interface NFTItem {
    toekenId: number;
    price: string;
    seller: string;
    owner: string;
    image: string;
    name: string;
    description: string;
}

interface MarketItem {
    tokenId: bigint;
    price: bigint;
    seller: string;
    owner: string;
    sold: boolean;
}
const CreatorDashboard = () => {
    const [nfts, setNfts] = useState<NFTItem[]>();
    const [loaded, setLoaded] = useState<boolean>(false);
    useEffect(() => {
        loadNFTs();
    }, [])
    async function loadNFTs() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        });
        const connection = await web3Modal.connect();

        const provider = new BrowserProvider(connection);
        const signer = await provider.getSigner();

        const contract = new Contract(marketplaceAddress, NFTBio.abi, signer);
        const data = await contract.fetchItemListed();
        const items = await Promise.all(data.map(async (i: MarketItem) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            const price = formatUnits(i.price, 'ether');
            const item: NFTItem = {
                price: price,
                toekenId: Number(i.tokenId),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description
            };

            return item;
        }));
        setNfts(items);
        setLoaded(true);
    }

    if (!loaded && nfts?.length) return <div>No listed items</div>;
    return (
        <div className='flex justify-center'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                {
                    nfts?.map((item, index) => (
                        <div className='border shadow rounded-xl overflow-hidden' key={index}>
                            <img src={item.image} alt={item.name} className='rounded' />
                            <div className="p-3 bg-black">
                                <p className="text-2xl font-bold text-white">Price - {item.price} ETH</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default CreatorDashboard;