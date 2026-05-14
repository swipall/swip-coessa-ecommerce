"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import type { CmsPost } from "@/lib/swipall/types/types";
import { BannerSliderBody, parsePostBody } from "../home-section-types";

interface HomeBannerSliderSectionProps {
    post: CmsPost;
    items: CmsPost[];
}

interface BannerItemBody {
    subtitle?: string;
    buttonText?: string;
}

export function HomeBannerSliderSection({
    post,
    items,
}: HomeBannerSliderSectionProps) {
    if (!items || items.length === 0) {
        return null;
    }

    const sliderConfig = parsePostBody<BannerSliderBody>(post.body);
    const autoplay = sliderConfig?.autoplay ?? true;
    const duration = sliderConfig?.duration ?? 5000;

    const getItemType = (item: CmsPost): "banner" | "image" => {
        return (item.title || item.excerpt) ? "banner" : "image";
    };

    return (
        <section className="max-w-7xl mx-auto bg-background">
            <div className="relative w-full overflow-hidden rounded-2xl">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={
                        autoplay
                            ? [
                                  Autoplay({
                                      delay: duration,
                                      stopOnInteraction: true,
                                  }),
                              ]
                            : []
                    }
                    className="w-full"
                >
                    <CarouselContent>
                        {items.map((item) => {
                            const itemType = getItemType(item);

                            if (itemType === "banner") {
                                return (
                                    <CarouselItem key={item.slug}>
                                        <BannerSliderItemFull item={item} />
                                    </CarouselItem>
                                );
                            } else {
                                return (
                                    <CarouselItem key={item.slug}>
                                        <BannerSliderItemSimple item={item} />
                                    </CarouselItem>
                                );
                            }
                        })}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="left-4 size-10" />
                        <CarouselNext className="right-4 size-10" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}

// Componente para banner completo (con título, subtítulo y botón)
function BannerSliderItemFull({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    const itemBody = parsePostBody<BannerItemBody>(item.body);
    const subtitle = itemBody?.subtitle;
    const buttonText = itemBody?.buttonText ?? "Ver más";

    return (
        <div className="flex flex-col sm:flex-row-reverse relative w-full">
            <Image
                src={item.featured_image}
                alt={item.title ?? "Banner"}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full sm:w-2/3 h-auto block px-6"
                priority
            />
           
            <div className="w-full sm:w-1/3 inset-0 flex items-center px-6">
                <div className="container mx-auto px-6">
                    <div className="text-primary space-y-4">
                        {subtitle && (
                            <p className="text-sm uppercase tracking-[0.2em] text-primary">
                                {subtitle}
                            </p>
                        )}
                        {item.title && (
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                {item.title}
                            </h2>
                        )}
                        {item.excerpt && (
                            <p className="text-base md:text-lg text-primary">
                                {item.excerpt}
                            </p>
                        )}
                        {item.link && (
                            <Button asChild size="lg">
                                <Link href={item.link}>{buttonText}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente para imagen simple (sin texto, con link opcional)
function BannerSliderItemSimple({ item }: { item: CmsPost }) {
    if (!item.featured_image) {
        return null;
    }

    if (item.link) {
        return (
            <Link href={item.link} className="block w-full group">
                <Image
                    src={item.featured_image}
                    alt="Banner"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto block group-hover:opacity-90 transition-opacity"
                    priority
                />
            </Link>
        );
    }

    return (
        <Image
            src={item.featured_image}
            alt="Banner"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto block"
            priority
        />
    );
}
