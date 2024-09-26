'use client';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import NFTBio from "../../../artifacts/contracts/NFTBio.sol/NFTBio.json";
import { marketplaceAddress } from "../../../config";
import axios from "axios";

interface NFTItem {
    tokenId: number;
    owner: string;
    seller: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

interface MarketItem {
    tokenId: bigint;
    owner: string;
    seller: string;
    price: bigint;
    sold: boolean;
}


const CreatorDashboard = () => {
    const [nfts, setNfts] = useState<NFTItem[]>();
    const [loading, setLoading] = useState<boolean>(true);

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

        const data = await contract.fetchMyNFTs();

        const items = await Promise.all(data.map(async (i: MarketItem) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            const price = formatUnits(i.price, 'ether');
            const item: NFTItem = {
                price,
                tokenId: Number(i.tokenId),
                seller: i.seller,
                owner: i.owner,
                name: meta.data.name,
                image: meta.data.image,
                description: meta.data.description
            }
            return item;
            
        }))
        setNfts(items);
        setLoading(false);
        console.log("data:", items);
    }

    return (
        <div>

        </div>
    );
}

export default CreatorDashboard;