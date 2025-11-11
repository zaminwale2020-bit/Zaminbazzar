"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import useMediaQuery from "@/hooks/useMediaQuery";

const BannerCarousel1 = () => {
    return (
        <>
            <div className="relative aspect-video h-full w-full flex md:hidden">
                <Image
                    loading="lazy"
                    src="/assets/banner-img/zaminwale-mob.avif"
                    alt="banner-img"
                    fill
                    className="object-contain sm:object-cover object-top sm:object-center h-full w-full"
                />
            </div>
            <div className="relative aspect-video h-full w-[calc(100%-100px)] rounded-b-3xl shadow-md hidden md:flex">
                <Image
                    loading="lazy"
                    src="/assets/banner-img/zaminwale.avif"
                    alt="banner-img"
                    fill
                    className="object-cover lg:object-cover object-center h-full w-full rounded-b-3xl"
                />
            </div>
        </>
    );
};

const BannerCarousel = () => {
    const isMD = useMediaQuery("(min-width: 768px)");

    return (
        <>
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 3000,
                    }),
                ]}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full h-full"
            >
                <CarouselContent className="w-full h-[300px] lg:h-[400px] flex ml-0">
                    {isMD ? (
                        <>
                            {WebsiteBanner.map((card, index) => (
                                <CarouselItem
                                    key={`${index}-img`}
                                    className="flex w-full h-full items-center justify-center pl-0"
                                >
                                    <div className="relative aspect-video h-full w-full max-w-[1400px] mx-auto rounded-b-3xl shadow-md hidden md:flex">
                                        <Image
                                            loading="lazy"
                                            src={`/assets/banner-img/${card.img}`}
                                            alt="banner-img"
                                            fill
                                            className="object-cover lg:object-cover object-center h-full w-full rounded-b-3xl"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </>
                    ) : (
                        <>
                            {MobileBanner.map((card, index) => (
                                <CarouselItem
                                    key={`${index}-img`}
                                    className="flex w-full h-full items-center justify-center pl-0"
                                >
                                    <div className="relative aspect-video h-full w-full flex md:hidden">
                                        <Image
                                            loading="lazy"
                                            src={`/assets/banner-img/${card.img}`}
                                            alt="banner-img"
                                            fill
                                            className="object-contain sm:object-cover object-top sm:object-center h-full w-full"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </>
                    )}
                </CarouselContent>
            </Carousel>
        </>
    );
};

export default BannerCarousel;

const WebsiteBanner = [
    {
        img: "zaminb1.avif",
    },
    {
        img: "popular-.jpg",
    },
    {
        img: "zaminb3.avif",
    },
];

const MobileBanner = [
    {
        img: "zaminmb1.avif",
    },
    {
        img: "zaminmb2.avif",
    },
    {
        img: "zaminmb3.avif",
    },
];
