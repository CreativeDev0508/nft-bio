import Link from "next/link";


const Navbar = () => {
    return (
        <div className="absolute top-0 left-0 w-full">
            <nav className="border-b p-2 pt-6 pl-6">
                <p className="text-3xl font-bold">Metaverse Marketplace</p>
                <div className="flex mt-4">
                    <Link href="/" className="mr-4 text-pink-500">
                        Home
                    </Link>
                    <Link href="/create-nft" className="mr-6 text-pink-500">
                        Sell NFT
                    </Link>
                    <Link href="/my-nfts" className="mr-6 text-pink-500">
                        My NFTs
                    </Link>
                    <Link href="/dashboard" className="mr-6 text-pink-500">
                        Dashboard
                    </Link>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;