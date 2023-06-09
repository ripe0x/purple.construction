/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  useContractRead,
  useBalance,
} from "wagmi";
import Nft from "../components/NFT";
import { auctionContract, tokenContract, treasuryContract } from "../config";
import { useIsMounted } from "usehooks-ts";
import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { ExtendedRecordMap } from "notion-types";
import { FaDiscord } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { Helmet } from "react-helmet";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css";
import { NextSeo } from "next-seo";
import { useDao, AuctionHero } from "nouns-builder-components";

export const getStaticProps = async () => {
  try {
    const api = new NotionAPI();
    const props = await api.getPage("Purple-977e889b565a427a9957b31e8789c291");
    return { props, revalidate: 10 };
  } catch (err) {
    console.error("page error", err);

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err;
  }
};

const Home: NextPage = (props) => {
  const dao = useDao();
  const isMounted = useIsMounted();
  let notionContent: ExtendedRecordMap = props as ExtendedRecordMap;
  const auction = useContractRead({
    address: auctionContract.address,
    abi: auctionContract.abi,
    functionName: "auction",
  }).data;

  const treasuryBalance = useBalance({
    address: "0xeB5977F7630035fe3b28f11F9Cb5be9F01A9557D",
    watch: true,
  }).data;

  const tokenURI = useContractRead({
    address: tokenContract.address,
    abi: tokenContract.abi,
    functionName: "tokenURI",
    args: [auction?.tokenId || BigNumber.from(35)],
    onError(error) {
      console.log("Error", error);
    },
  }).data;

  const totalSupply = useContractRead({
    address: tokenContract.address,
    abi: tokenContract.abi,
    functionName: "totalSupply",
    onError(error) {
      console.log("Error", error);
    },
  }).data;

  useEffect(() => {
    if (tokenURI) {
      const clean: string = tokenURI?.substring(29);
      const json = Buffer.from(clean, "base64").toString();
      const result = JSON.parse(json);
    }
  }, [tokenURI]);

  const daoConfig = {
    title: "Purple",
    description:
      "Purple is a DAO whose goal is to proliferate and expand the Farcaster protocol and ecosystem.",
    url: "https://purple.construction/",
    shareGraphic: "https://purple.construction/purple/share-graphic.png",
    discordLink: "https://discord.gg/4GUeHBRBNV",
    twitterLink: "",
    farcasterLink: "https://fcast.me/purple",
  };

  return (
    <div className="container">
      <Head>
        <title>{daoConfig.title}</title>
        <meta name="Purple" content="" />
        <link rel="icon" href="/purple/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@400;900&family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <NextSeo
        title={daoConfig.title}
        description={daoConfig.description}
        openGraph={{
          title: daoConfig.title,
          description: daoConfig.description,
          url: daoConfig.url,
          site_name: daoConfig.title,
          images: [
            {
              url: daoConfig.shareGraphic,
              width: 500,
              height: 500,
              alt: `${daoConfig.title} Share graphic`,
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          site: daoConfig.url,
          handle: "",
        }}
      />

      <main className="min-h-screen flex-col gap-8">
        <div className="flex flex-row gap-10 items-center justify-between p-5">
          <div className="flex flex-row gap-5 items-center justify-between md:p-5">
            <p className="text-xl font-bold">{daoConfig.title}</p>
            <div className="flex flex-col">
              <p className="font-bold leading-none	">
                Ξ {isMounted() && treasuryBalance ? Math.floor(+treasuryBalance?.formatted) : <Skeleton />}
              </p>
              <p className="text-sm text-gray-700 opacity-60 leading-none whitespace-nowrap">
                treasury balance
              </p>
            </div>
          </div>

          <nav>
            <ul className="flex flex-row gap-2 md:gap-5 md:p-5 items-center">
              <li className="hidden md:block">
                <a href="#auction">Auction</a>
              </li>
              <li className="hidden md:block">
                <a href="#about">About</a>
              </li>
              <li className="hidden md:block">
                <a href="#collection">Collection</a>
              </li>
              <li className="hidden md:block">
                <a
                  href="https://nouns.build/dao/0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60"
                  rel="noopener"
                  className="external"
                >
                  DAO
                </a>
              </li>
              {daoConfig.discordLink && (
                <li className="flex items-center">
                  <a href={daoConfig.discordLink} rel="noopener">
                    <FaDiscord />
                  </a>
                </li>
              )}
              {daoConfig.twitterLink && (
                <li className="flex items-center">
                  <a href={daoConfig.twitterLink} rel="noopener">
                    <FaTwitter />
                  </a>
                </li>
              )}
              {daoConfig.farcasterLink && (
                <li className="flex items-center">
                  <a href={daoConfig.farcasterLink} rel="noopener">
                    <img
                      src="/img/logo-farcaster.svg"
                      alt="Farcaster logo"
                      className="w-4"
                    />
                  </a>
                </li>
              )}
              <ConnectButton label="Connect" />
            </ul>
          </nav>
        </div>
        {dao && (
          <div id="auction" className="p-5 md:p-20 col-span-2 w-full">
            <div className="flex justify-center">
              <AuctionHero
                dao={dao}
                opts={{
                  theme: "base",
                }}
              />
            </div>
          </div>
        )}
        <hr className="w-full border-gray-300 my-10" />
        <div id="about" className="p-8 mt-10 col-span-2 justify-center w-full">
          <div className="mx-auto max-w-[40rem] flex flex-col gap-2 items-start">
            <NotionRenderer
              recordMap={notionContent}
              fullPage={true}
              darkMode={false}
            />
          </div>
        </div>
        <hr className="w-full border-gray-300 my-10" />
        <div className="p-8 mt-10 justify-center w-full">
          <h2 className="text-center w-full text-xl mb-5">
            {daoConfig.title} Collection
          </h2>

          <div
            id="collection"
            className="mx-auto grid md:grid-cols-5 lg:grid-cols-9 gap-5 md:gap-2"
          >
            {isMounted() &&
              totalSupply &&
              [...Array(totalSupply?.toNumber())].map((a, i) => {
                return (
                  <Nft key={i} tokenId={totalSupply?.toNumber() - i - 1} />
                );
              })}
          </div>
        </div>
      </main>
      <footer className="text-center flex flex-col gap-5 justify-center pb-10">
        <hr className="w-full border-gray-300 my-10" />
        <div className="flex flex-col gap-2 items-center">
          <div className="max-w-[5rem]">
            <a href="https://nouns.build/">
              <svg
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 696 186"
                fill="black"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <g clipPath="url(#builder-framed_svg__a)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M528.24 0v186h-18.6V0h18.6Zm167.4 0v186h-74.4V0h74.4Zm-102.3 186V0h-37.2v186h37.2Z"
                    fill="#000"
                  ></path>
                </g>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M175.072 31h58.358v124h-58.358V31Zm204.251 0h58.358v124h-58.358V31Z"
                  fill="#000"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M116.715 31h58.357v124h-58.357V31Zm204.251 0h58.357v124h-58.357V31Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#000"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#FFFFFF"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#CCCCCC"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#00EDCF"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#20B0EC"
                ></path>
                <path
                  d="M291.788 0v62h-29.179V0H87.536v62H0v93h29.179V93h58.357v93H262.61V93h29.179v93H466.86V0H291.788ZM233.43 155H116.715V31H233.43v124Zm204.251 0H320.966V31h116.715v124Z"
                  fill="#0085FF"
                ></path>
                <defs>
                  <clipPath id="builder-framed_svg__a">
                    <path
                      fill="#fff"
                      transform="translate(509.64)"
                      d="M0 0h186v186H0z"
                    ></path>
                  </clipPath>
                </defs>
              </svg>
            </a>
          </div>
          <p>
            built on{" "}
            <a href="https://nouns.build/" className="underline">
              nouns builder
            </a>
          </p>
        </div>
      </footer>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://unpkg.com/nouns-builder-components@latest/dist/index.css"
        />
      </Helmet>
    </div>
  );
};

export default Home;
