import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCollectionsMobile } from '@/components/layout/navbar/navbar-collections-mobile';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { MobileMenu } from '@/components/layout/navbar/mobile-menu';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import { NavbarScrollWrapper } from '@/components/layout/navbar/navbar-scroll-wrapper';

export function Navbar() {
    return (
        <NavbarScrollWrapper>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between py-2">
                    {/* Left: hamburger (mobile) + logo + desktop nav */}
                    <div className="flex items-center gap-3">
                        <Suspense>
                            <MobileMenu>
                                <NavbarCollectionsMobile />
                            </MobileMenu>
                        </Suspense>

                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src="https://mmcb.b-cdn.net/media/attachments/b/1/9/3/835bf7236b2fc15a4e82cfacd1579cdfd3a73195ea2ae775a9e7480993fb/logo.png"
                                alt="Swipall"
                                width={40}
                                height={27}
                                className="h-14 w-auto dark:invert"
                                priority
                            />
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </nav>
                    </div>

                    {/* Right: search (desktop) + cart + user */}
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>

                        <ThemeSwitcher />
                        <div className="hidden">
                            <Suspense>
                                <NavbarCart />
                            </Suspense>
                            <NavbarUser />
                        </div>

                    </div>
                </div>

                {/* Mobile: buscador debajo de la barra principal */}
                <div className="lg:hidden pb-2">
                    <Suspense fallback={<SearchInputSkeleton />}>
                        <SearchInput />
                    </Suspense>
                </div>
            </div>
        </NavbarScrollWrapper>
    );
}
