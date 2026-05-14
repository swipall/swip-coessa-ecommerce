import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import Image from "next/image";
import Link from "next/link";

const FOOTER_MENUS = [
    { slug: 'informacion',        title: 'Información' },
    { slug: 'ayuda',              title: 'Ayuda' },
    { slug: 'datos-de-contacto',  title: 'Datos de Contacto' },
];

async function fetchMenuChildren(parentSlug: string): Promise<CmsPost[]> {
    try {
        const res = await getPosts({ parent__slug: parentSlug, ordering: 'ordering' });
        return res?.results ?? [];
    } catch {
        return [];
    }
}

async function Copyright() {
    'use cache';
    cacheLife('days');
    return (
        <div className='text-muted-foreground'>
            © {new Date().getFullYear()} KOI Collectibles. All rights reserved.
        </div>
    );
}

export async function Footer() {
    'use cache';
    cacheLife('days');

    const menus = await Promise.all(
        FOOTER_MENUS.map(async (menu) => ({
            ...menu,
            items: await fetchMenuChildren(menu.slug),
        }))
    );

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand column */}
                    <div className="flex flex-col gap-4">
                        <Link href="/">
                            <Image
                                src="https://mmcb.b-cdn.net/media/attachments/b/1/9/3/835bf7236b2fc15a4e82cfacd1579cdfd3a73195ea2ae775a9e7480993fb/logo.png"
                                alt="COESSA COLCHONES"
                                width={120}
                                height={40}
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Dynamic menu columns */}
                    {menus.map((menu) => (
                        <div key={menu.slug}>
                            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-primary">
                                {menu.title}
                            </h4>
                            <ul className="space-y-2 text-sm">
                                {menu.items.length === 0 && (
                                    <li className="italic opacity-40">Sin contenido</li>
                                )}
                                {menu.items.map((item) => (
                                    <li key={item.slug}>
                                        {item.link ? (
                                            <Link
                                                href={item.link}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <span className="hover:text-primary transition-colors cursor-default">
                                                {item.title}
                                                {item.excerpt && (
                                                    <span className="block text-xs mt-0.5 opacity-70">
                                                        {item.excerpt}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <Copyright />
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Powered by</span>
                        <a
                            href="https://swipall.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                        >
                            <Image
                                src="/swipall-icon.svg"
                                alt="Swipall"
                                width={40}
                                height={27}
                                className="h-4 w-auto dark:invert"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
