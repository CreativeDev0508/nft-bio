"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import web3Modal from "web3modal"
import NFTBio from "../../../artifacts/contracts/NFTBio.sol/NFTBio.json";
import { marketplaceAddress } from "../../../config";
import { useRouter, useSearchParams } from "next/navigation";

interface NFTItem {
    price: string;
    image: string;
    name: string;
}

const ResellNFT = () => {
    const [formInput, updateFormInput] = useState<NFTItem>({ price: '', image: '', name: '' });
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenUri = searchParams.get('tokenURI');
    const id = searchParams.get('id');
    const { price, image } = formInput;


    const fetchNFT = useCallback(async () => {
        if (!tokenUri) return;
        const meta = await axios.get(tokenUri);
        updateFormInput(state => ({ ...state, image: meta.data.image, name: meta.data.name }))
    }, [tokenUri])

    useEffect(() => {
        fetchNFT();
    }, [fetchNFT]);

    async function listNFTForSale() {
        if (!price) return;
        const Web3Modal = new web3Modal();
        const connection = await Web3Modal.connect();
        const provider = new BrowserProvider(connection);
        const signer = await provider.getSigner();

        const contract = new Contract(marketplaceAddress, NFTBio.abi, signer);
        const priceInWei = parseUnits(price, 'ether');
        const listingPrice = await contract.getListingPrice();
        const transaction = await contract.resellToken(id, priceInWei, { value: listingPrice.toString() })
        await transaction.wait();

        router.push('/');
    }



    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                {
                    image && (
                        // <img className="rounded mt-4 w-full" src={image} />
                        <div className="flex justify-center">
                            <Image
                                src={image}
                                alt={formInput.name}
                                width={500}
                                height={300}
                                // layout="responsive"
                            />
                        </div>
                    )
                }
                <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    List NFT
                </button>
            </div>
        </div>
    );
}

export default ResellNFT;