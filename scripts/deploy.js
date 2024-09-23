// eslint-disable-next-line @typescript-eslint/no-var-requires
const hre = require("hardhat");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
const { ethers } = hre;

async function main() {
    const NFTbio = await ethers.getContractFactory('NFTBio');
    const nftbio = await NFTbio.deploy();
    const listingprice = await nftbio.getListingPrice();
    console.log("NFTBio deployed to:", nftbio.target);
    console.log("listingPrice:", listingprice);
    
    fs.writeFileSync('./config.ts', `
  export const marketplaceAddress = "${nftbio.target}";
  export const marketplaceOwnerAddress = "${nftbio.runner.address}";
  `)
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })