import type {Metadata} from 'next';
import Link from 'next/link';
import {Package, User, MapPin} from 'lucide-react';
import {noIndexRobots} from '@/lib/metadata';

export const metadata: Metadata = {
    robots: noIndexRobots(),
};

const navItems = [
    {href: '/account/orders', label: 'Pedidos', icon: Package},
    {href: '/account/addresses', label: 'Direcciones', icon: MapPin},
    {href: '/account/profile', label: 'Perfil', icon: User},
];

export default async function AccountLayout({children}: LayoutProps<'/account'>) {
    return (
        <div className="container mx-auto px-4 py-30">
            <div className="flex gap-8">
                <aside className="w-64 shrink-0">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                            >
                                <item.icon className="h-5 w-5"/>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
