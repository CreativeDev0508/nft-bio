// const {
//   time,
//   loadFixture,
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expect } = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ethers } = require("hardhat");

describe("NFTBIo", async function () {
  let nftMarketplace, owner, seller, buyer, listingPrice, auctionPrice;

  beforeEach(async function () {
    // Get signers for test accounts
    [owner, seller, buyer] = await ethers.getSigners();


    // Deploy the NFT marketplace contract
    const NFTBio = await ethers.getContractFactory("NFTBio");
    nftMarketplace = await NFTBio.deploy();
    await nftMarketplace.waitForDeployment(); // For Ethers v6 compatibility

    // Set the listing price
    listingPrice = await nftMarketplace.getListingPrice();

    auctionPrice = ethers.parseEther('1'); // 1 ETH in wei
  });

  it("Should get listingPrice", async function () {
    console.log("listingPrice:", listingPrice.toString());
    // const dd = await nftMarketplace.owner();
    console.log("owner:", owner);
    // console.log("dd-->", nftMarketplace);
  })

  it("Should deploy the contract correctly", async function () {
    expect(await nftMarketplace.runner.address).to.equal(owner.address)
  });

  it("Should update listingPrice", async function () {
    await nftMarketplace.updateListingPrice(ethers.parseEther('0.0005'))
    const newPrice = await nftMarketplace.getListingPrice();
    expect(newPrice).to.equal(ethers.parseEther('0.0005'));

  });

  it("Should fall to update listing price if not the owner", async function () {
    await expect(nftMarketplace.connect(seller).updateListingPrice(ethers.parseEther('0.005'))).to.be.revertedWith("Only the owner can update the listing price");
  });

  it("Should mint token and list it on marketplace", async function () {
    const tokenURI = "https://mytokenlocation.com";

    await nftMarketplace.connect(seller).createToken(tokenURI, auctionPrice, { value: listingPrice });
    let items = await nftMarketplace.fetchMarketItems();
    expect(items.length).to.equal(1);
    expect(Number(items[0].tokenId)).to.equal(1);
    expect(items[0].seller).to.equal(seller.address);
    expect(items[0].price).to.equal(auctionPrice);

    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftMarketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  });

  it("Should allow a user to create MarketItem sale", async function () {
    const tokenURI = "https://mytokenlocation.com";
    await nftMarketplace.connect(seller).createToken(tokenURI, auctionPrice, { value: listingPrice });
    await nftMarketplace.connect(buyer).createMarketSale(1, { value: auctionPrice });

    const items = await nftMarketplace.fetchMarketItems();

    expect(items.length).to.equal(0);

    const ownedItems = await nftMarketplace.connect(buyer).fetchMyNFTs();
    expect(ownedItems.length).to.equal(1);
    expect(ownedItems[0].owner).to.equal(buyer.address);
  })

  it("Should allow a user to resale the MarketItem", async function () {
    const tokenURI = "https://mytokenlocation.com";
    await nftMarketplace.connect(seller).createToken(tokenURI, auctionPrice, { value: listingPrice });
    await nftMarketplace.connect(buyer).createMarketSale(1, { value: auctionPrice });

    const ownedItems = await nftMarketplace.connect(buyer).fetchMyNFTs();

    expect(ownedItems.length).to.equal(1);

    await nftMarketplace.connect(buyer).resellToken(1, ethers.parseEther("2"), { value: listingPrice });

    const items = await nftMarketplace.connect(buyer).fetchMarketItems();

    expect(items.length).to.equal(1);
    expect(items[0].price).to.equal(ethers.parseEther("2"));
    expect(items[0].seller).to.equal(buyer.address);
    console.log(items);

  })

  it("Should fetch items listed by user", async function () {
    const tokenURI = "https://mytokenlocation.com";
    const tokenURI1 = "https://mytokenlocation1.com";
    await nftMarketplace.connect(seller).createToken(tokenURI, auctionPrice, { value: listingPrice });
    await nftMarketplace.connect(seller).createToken(tokenURI1, auctionPrice, { value: listingPrice });

    await nftMarketplace.connect(buyer).createMarketSale(1, {value: auctionPrice});
    await nftMarketplace.connect(buyer).createMarketSale(2, {value: auctionPrice});
    await nftMarketplace.connect(buyer).resellToken(1, ethers.parseEther("3"), { value: listingPrice });

    const items = await nftMarketplace.connect(buyer).fetchItemListed();
    const ownedItems = await nftMarketplace.connect(buyer).fetchMyNFTs();    

    expect(items.length).to.equal(1);
    expect(ownedItems.length).to.equal(1);
  })

  it("Should fail to create market sale with incorrect price", async function () {
    const tokenURI = "https://mytokenlocation.com";
    await nftMarketplace.connect(seller).createToken(tokenURI, auctionPrice, { value: listingPrice });
    
    await expect(
      nftMarketplace.connect(buyer).createMarketSale(1, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Please submit the asking price in order to complete the purchase.");
  });
})
