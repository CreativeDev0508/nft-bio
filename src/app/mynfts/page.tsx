'use client';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import NFTBio from "../../../artifacts/contracts/NFTBio.sol/NFTBio.json";
import { marketplaceAddress } from "../../../config";
import axios from "axios";
import { useRouter } from 'next/navigation';
interface NFTItem {
    tokenId: number;
    owner: string;
    seller: string;
    name: string;
    image: string;
    price: string;
    description: string;
    tokenUri:string;
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
    const router = useRouter();
    useEffect(() => {
        loadNFTs();
    }, []);

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
                description: meta.data.description,
                tokenUri,
            }
            return item;

        }))
        setNfts(items);
        setLoading(false);
        console.log("data:", items);
    };

    function listNFT(nft: NFTItem) {
        router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
    }
    if (loading && !nfts?.length) return <div>No owned items</div>

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                    {nfts?.map((nft, i) => (

                        <div className="border shadow rounded-xl overflow-hidden" key={i}>
                            <img src={nft.image} alt={nft.name} style={{ width: "100%", height: "58%", }} className='rounded' />
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                                <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CreatorDashboard;