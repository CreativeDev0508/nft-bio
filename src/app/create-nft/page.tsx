"use client";
import { useState, ChangeEvent } from "react";

interface FormInput {
    name: string;
    price: string;
    description: string;
}

const CreateNFT = () => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [formInput, setFormInput] = useState<FormInput>({ name: "", price: "", description: "" });

    async function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if(!file) return;

        
        console.log(file);
        
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
                <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create NFT
                </button>
            </div>
        </div>
    );
}

export default CreateNFT;