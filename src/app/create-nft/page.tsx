"use client";
import { useState, ChangeEvent } from "react";
import axios from "axios";
import Web3Modal from 'web3modal';
import { BrowserProvider, Contract, parseUnits } from 'ethers';
import { marketplaceAddress } from "../../../config";
import { useRouter } from "next/navigation";
import NFTBio from "../../../artifacts/contracts/NFTBio.sol/NFTBio.json";
interface FormInput {
    name: string;
    price: string;
    description: string;
}



const CreateNFT = () => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [formInput, setFormInput] = useState<FormInput>({ name: "", price: "", description: "" });
    const router = useRouter();

    async function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const data = new FormData();
        data.append('file', file);

        const metadata = JSON.stringify({
            name: file.name,
        });

        data.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });

        data.append('pinataOptions', options);

        try {
            const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
                maxBodyLength: Infinity,
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`
                },
            });

            const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
            setFileUrl(url);
        } catch (error) {
            console.error('Error uploading file:', error)
        }
    }

    async function uploadToIPFS() {
        const { name, price, description } = formInput;
        if (!name || !price || !description || !fileUrl) return;

        const metadata = {
            name,
            description,
            image: fileUrl,
        }

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`
                }
            });

            return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;

        } catch (error) {
            console.error("Error uploading metadata to pinata:", error);
        }
    }

    async function listNFTForSale() {
        const nftUrl = await uploadToIPFS();
        if (!nftUrl) return;

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new BrowserProvider(connection);
        const signer = await provider.getSigner();

        const contract = new Contract(marketplaceAddress, NFTBio.abi, signer);
        const price = parseUnits(formInput.price, 'ether');
        console.log("contract:", contract);
        
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();

        const createToken = await contract.createToken(nftUrl, price, { value: listingPrice });
        await createToken.wait();
        router.push('/');

    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={(e) => {
                        setFormInput({ ...formInput, name: e.target.value })
                    }}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={(e) => {
                        setFormInput({ ...formInput, description: e.target.value })
                    }}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={(e) => {
                        setFormInput({ ...formInput, price: e.target.value })
                    }}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={handleChange}
                />
                <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" onClick={listNFTForSale}>
                    Create NFT
                </button>
            </div>
        </div>
    );
}

export default CreateNFT;