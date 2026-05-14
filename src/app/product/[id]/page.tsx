import { ProductImageCarousel } from '@/components/commerce/product-image-carousel';
import { ExtraMaterialsInterface, ProductInfo } from '@/components/commerce/product-info';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    buildCanonicalUrl,
    buildOgImages,
    SITE_NAME,
    truncateDescription,
} from '@/lib/metadata';
import { getProduct } from '@/lib/swipall/rest-adapter';
import { InterfaceInventoryItem, Material, ProductKind } from '@/lib/swipall/types/types';
import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getCompoundMaterials } from './actions';
import { getAuthToken, getAuthUserCustomerId } from '@/lib/auth';

async function getProductData(id: string, customerId?: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`product-${id}`);

    try {
        const result = await getProduct(id, customerId);
        return result;
    } catch (error) {
        return null;
    }
}


const onGroupMaterialsByTaxonomy = (materials: Material[]): ExtraMaterialsInterface => {
    const grouped: { [id: string]: { id: string; value: string; materials: Material[] } } = {};

    (materials || []).forEach((item: any) => {
        const tax = item.material.taxonomy?.[0];
        const id = tax?.id || 'adicionales';
        const value = tax?.value || 'Adicionales';

        if (!grouped[id]) {
            grouped[id] = { id, value, materials: [] };
        }
        grouped[id].materials.push(item.material);
    });

    const compoundMaterials = Object.values(grouped)
        .sort((a, b) => a.value.localeCompare(b.value, 'es', { sensitivity: 'base' }))
        .map(({ value, materials }) => ({
            taxonomy: value,
            materials
        }));
    return compoundMaterials;
}

async function fetchProductMaterials(product: InterfaceInventoryItem | null) {
    if (!product) {
        return null;
    }
    const token = await getAuthToken();
    if (product.kind === ProductKind.Compound && token) {
        const compoundMaterials = await getCompoundMaterials(product.id, {});
        product.extra_materials = onGroupMaterialsByTaxonomy(compoundMaterials.results);
    }
    return product;
}

export async function generateMetadata({
    params,
}: PageProps<'/product/[id]'>): Promise<Metadata> {
    const { id: encodedId } = await params;
    const id = decodeURIComponent(encodedId);
    const customerId = await getAuthUserCustomerId();
    const result = await getProductData(id, customerId);

    const product = result;
    if (!product) {
        return {
            title: 'Producto no encontrado',
        };
    }

    const description = truncateDescription((product as any).description || product.name);
    const ogImage = product.featured_image;

    return {
        title: product.name,
        description: description || `Compra ${product.name} en ${SITE_NAME}`,
        alternates: {
            canonical: buildCanonicalUrl(`/product/${product.id}`),
        },
        openGraph: {
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            type: 'website',
            url: buildCanonicalUrl(`/product/${product.id}`),
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps<'/product/[id]'>) {
    const { id: encodedId } = await params;
    const searchParamsResolved = await searchParams;
    const id = decodeURIComponent(encodedId);
    const customerId = await getAuthUserCustomerId();
    const result = await getProductData(id, customerId);
    const product = await fetchProductMaterials(result);
    if (!product) {
        notFound();
    }
    // const primaryCollection = product.taxonomy?.[0]; //TODO: Supoort related products

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Image Carousel */}
                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <ProductImageCarousel images={[
                            ...(product.featured_image ? [product.featured_image] : []),
                            ...(product.pictures?.map(p => p.url).filter(url => url !== product.featured_image) ?? []),
                        ]} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div>
                        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                        {/* {product.description && (
                            <p className="text-white/50 mb-6">{product.description}</p>
                        )} */}
                        <ProductInfo product={product} searchParams={searchParamsResolved} />
                    </div>
                </div>
            </div>

            {/* Product Benefits Section */}
            <section className="py-16 bg-muted/30 mt-12">
                <div className="container mx-auto px-4 rounded-xl p-8">
                    <div className='p-8'>
                        <div className='mb-8 pb-8'>
                            <h2 className="text-2xl font-bold text-center mb-8">Por qué elegirnos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                         
                            <article className="bg-card rounded-2xl p-8 card-hover flex flex-col gap-5">
                                <div className="flex w-12 bg- bg-background bg-opacity-50 items-center justify-center rounded-full h-12 z-10 p-2 mb-2">
                                    <svg className="h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M96 96C78.3 96 64 110.3 64 128L64 496C64 522.5 85.5 544 112 544L528 544C554.5 544 576 522.5 576 496L576 216.2C576 198 556.6 186.5 540.6 195.1L384 279.4L384 216.2C384 198 364.6 186.5 348.6 195.1L192 279.4L192 128C192 110.3 177.7 96 160 96L96 96z"></path></svg>
                                </div>
                                <div className="divider bg-secondary"></div>
                                <h2 className="text-primary text-xl font-bold leading-snug">
                                    Fabricación Directa
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Coessa <span className="font-semibold text-primary">fabrica sus propios colchones</span>, lo que garantiza un control total del proceso desde la materia prima hasta el producto terminado.
                                </p>
                                <ul className="space-y-3 mt-8">
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M320 64C324.6 64 329.2 65 333.4 66.9L521.8 146.8C543.8 156.1 560.2 177.8 560.1 204C559.6 303.2 518.8 484.7 346.5 567.2C329.8 575.2 310.4 575.2 293.7 567.2C121.3 484.7 80.6 303.2 80.1 204C80 177.8 96.4 156.1 118.4 146.8L306.7 66.9C310.9 65 315.4 64 320 64zM320 130.8L320 508.9C458 442.1 495.1 294.1 496 205.5L320 130.9L320 130.9z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Mayor control de calidad en cada etapa</span>
                                    </li>
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M96 128C78.3 128 64 142.3 64 160C64 177.7 78.3 192 96 192L182.7 192C195 220.3 223.2 240 256 240C288.8 240 317 220.3 329.3 192L544 192C561.7 192 576 177.7 576 160C576 142.3 561.7 128 544 128L329.3 128C317 99.7 288.8 80 256 80C223.2 80 195 99.7 182.7 128L96 128zM96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L342.7 352C355 380.3 383.2 400 416 400C448.8 400 477 380.3 489.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L489.3 288C477 259.7 448.8 240 416 240C383.2 240 355 259.7 342.7 288L96 288zM96 448C78.3 448 64 462.3 64 480C64 497.7 78.3 512 96 512L150.7 512C163 540.3 191.2 560 224 560C256.8 560 285 540.3 297.3 512L544 512C561.7 512 576 497.7 576 480C576 462.3 561.7 448 544 448L297.3 448C285 419.7 256.8 400 224 400C191.2 400 163 419.7 150.7 448L96 448z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Personalización real del producto</span>
                                    </li>
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M433.2 103.1L581.4 253.4C609.1 281.5 609.1 326.5 581.4 354.6L425 512.9C415.7 522.3 400.5 522.4 391.1 513.1C381.7 503.8 381.6 488.6 390.9 479.2L547.3 320.8C556.5 311.5 556.5 296.4 547.3 287.1L399 136.9C389.7 127.5 389.8 112.3 399.2 103C408.6 93.7 423.8 93.8 433.1 103.2zM64.1 293.5L64.1 160C64.1 124.7 92.8 96 128.1 96L261.6 96C278.6 96 294.9 102.7 306.9 114.7L450.9 258.7C475.9 283.7 475.9 324.2 450.9 349.2L317.4 482.7C292.4 507.7 251.9 507.7 226.9 482.7L82.9 338.7C70.9 326.7 64.2 310.4 64.2 293.4zM208.1 208C208.1 190.3 193.8 176 176.1 176C158.4 176 144.1 190.3 144.1 208C144.1 225.7 158.4 240 176.1 240C193.8 240 208.1 225.7 208.1 208z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Mejor relación calidad–precio sin intermediarios</span>
                                    </li>
                                </ul>
                            </article>

                            <article className="bg-primary rounded-2xl p-8 card-hover flex flex-col gap-5 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full  bg-accent opacity-30"></div>
                                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-accent opacity-20"></div>

                                <span className="flex w-12 bg- bg-secondary bg-opacity-50 items-center justify-center rounded-full h-12 z-10 p-2 mb-2">
                                    <svg className="h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ffffff" d="M296.5 69.2C311.4 62.3 328.6 62.3 343.5 69.2L562.1 170.2C570.6 174.1 576 182.6 576 192C576 201.4 570.6 209.9 562.1 213.8L343.5 314.8C328.6 321.7 311.4 321.7 296.5 314.8L77.9 213.8C69.4 209.8 64 201.3 64 192C64 182.7 69.4 174.1 77.9 170.2L296.5 69.2zM112.1 282.4L276.4 358.3C304.1 371.1 336 371.1 363.7 358.3L528 282.4L562.1 298.2C570.6 302.1 576 310.6 576 320C576 329.4 570.6 337.9 562.1 341.8L343.5 442.8C328.6 449.7 311.4 449.7 296.5 442.8L77.9 341.8C69.4 337.8 64 329.3 64 320C64 310.7 69.4 302.1 77.9 298.2L112 282.4zM77.9 426.2L112 410.4L276.3 486.3C304 499.1 335.9 499.1 363.6 486.3L527.9 410.4L562 426.2C570.5 430.1 575.9 438.6 575.9 448C575.9 457.4 570.5 465.9 562 469.8L343.4 570.8C328.5 577.7 311.3 577.7 296.4 570.8L77.9 469.8C69.4 465.8 64 457.3 64 448C64 438.7 69.4 430.1 77.9 426.2z"></path></svg>
                                </span>
                                <div className="divider bg-accent relative z-10"></div>
                                <h2 className="text-white text-xl font-bold leading-snug relative z-10">
                                    Líneas de Producto
                                </h2>
                                <p className="text-white text-sm leading-relaxed relative z-10">
                                    Portafolio diseñado para durar, no solo para impresionar al primer contacto.
                                </p>
                                <ul className="space-y-3 mt-8 relative z-10">
                                    <li className="flex items-center gap-3 bg-secondary bg-opacity-50 rounded-xl px-4 py-3">
                                        <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ffffff" d="M345 151.2C354.2 143.9 360 132.6 360 120C360 97.9 342.1 80 320 80C297.9 80 280 97.9 280 120C280 132.6 285.9 143.9 295 151.2L226.6 258.8C216.6 274.5 195.3 278.4 180.4 267.2L120.9 222.7C125.4 216.3 128 208.4 128 200C128 177.9 110.1 160 88 160C65.9 160 48 177.9 48 200C48 221.8 65.5 239.6 87.2 240L119.8 457.5C124.5 488.8 151.4 512 183.1 512L456.9 512C488.6 512 515.5 488.8 520.2 457.5L552.8 240C574.5 239.6 592 221.8 592 200C592 177.9 574.1 160 552 160C529.9 160 512 177.9 512 200C512 208.4 514.6 216.3 519.1 222.7L459.7 267.3C444.8 278.5 423.5 274.6 413.5 258.9L345 151.2z"></path></svg>
                                        <span className="text-white text-sm font-medium">Premium</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-secondary bg-opacity-50 rounded-xl px-4 py-3">
                                        <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ffffff" d="M320.3 192L235.7 51.1C229.2 40.3 215.6 36.4 204.4 42L117.8 85.3C105.9 91.2 101.1 105.6 107 117.5L176.6 256.6C146.5 290.5 128.3 335.1 128.3 384C128.3 490 214.3 576 320.3 576C426.3 576 512.3 490 512.3 384C512.3 335.1 494 290.5 464 256.6L533.6 117.5C539.5 105.6 534.7 91.2 522.9 85.3L436.2 41.9C425 36.3 411.3 40.3 404.9 51L320.3 192zM351.1 334.5C352.5 337.3 355.1 339.2 358.1 339.6L408.2 346.9C415.9 348 418.9 357.4 413.4 362.9L377.1 398.3C374.9 400.5 373.9 403.5 374.4 406.6L383 456.5C384.3 464.1 376.3 470 369.4 466.4L324.6 442.8C321.9 441.4 318.6 441.4 315.9 442.8L271.1 466.4C264.2 470 256.2 464.2 257.5 456.5L266.1 406.6C266.6 403.6 265.6 400.5 263.4 398.3L227.1 362.9C221.5 357.5 224.6 348.1 232.3 346.9L282.4 339.6C285.4 339.2 288.1 337.2 289.4 334.5L311.8 289.1C315.2 282.1 325.1 282.1 328.6 289.1L351 334.5z"></path></svg>
                                        <span className="text-white text-sm font-medium">Comfort Plus</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-secondary bg-opacity-50 rounded-xl px-4 py-3">
                                        <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ffffff" d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 128C512 92.7 483.3 64 448 64L192 64zM304 416L336 416C353.7 416 368 430.3 368 448L368 528L272 528L272 448C272 430.3 286.3 416 304 416zM224 176C224 167.2 231.2 160 240 160L272 160C280.8 160 288 167.2 288 176L288 208C288 216.8 280.8 224 272 224L240 224C231.2 224 224 216.8 224 208L224 176zM368 160L400 160C408.8 160 416 167.2 416 176L416 208C416 216.8 408.8 224 400 224L368 224C359.2 224 352 216.8 352 208L352 176C352 167.2 359.2 160 368 160zM224 304C224 295.2 231.2 288 240 288L272 288C280.8 288 288 295.2 288 304L288 336C288 344.8 280.8 352 272 352L240 352C231.2 352 224 344.8 224 336L224 304zM368 288L400 288C408.8 288 416 295.2 416 304L416 336C416 344.8 408.8 352 400 352L368 352C359.2 352 352 344.8 352 336L352 304C352 295.2 359.2 288 368 288z"></path></svg>
                                        <span className="text-white text-sm font-medium">Hotelera</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-secondary bg-opacity-50 rounded-xl px-4 py-3">
                                        <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#ffffff" d="M384 128C384 92.7 355.3 64 320 64C284.7 64 256 92.7 256 128C256 163.3 284.7 192 320 192C355.3 192 384 163.3 384 128zM280.9 233.3C257.2 224.9 236.4 209 222.1 187.5L202.6 158.2C192.8 143.5 173 139.6 158.3 149.4C143.6 159.2 139.6 179 149.4 193.8L168.9 223C187 250.1 211.7 271.4 240 285.4L240 544C240 561.7 254.3 576 272 576C289.7 576 304 561.7 304 544L304 448L336 448L336 544C336 561.7 350.3 576 368 576C385.7 576 400 561.7 400 544L400 285.6C429.1 271.4 454.4 249.4 472.7 221.4L490.9 193.5C500.5 178.7 496.3 158.9 481.5 149.2C466.7 139.5 446.9 143.7 437.2 158.6L419 186.4C397.2 219.8 360.1 240 320.2 240C307.6 240 295.3 238 283.6 234.2C282.7 233.9 281.8 233.5 280.9 233.3z"></path></svg>
                                        <span className="text-white text-sm font-medium">Infantil</span>
                                    </li>
                                </ul>
                            </article>

                            <article className="bg-card rounded-2xl p-8 card-hover flex flex-col gap-5">
                                <div className="flex w-12 bg- bg-background bg-opacity-50 items-center justify-center rounded-full h-12 z-10 p-2 mb-2">
                                    <svg className="h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"></path></svg>
                                </div>
                                <div className="divider bg-accent"></div>
                                <h2 className="text-primary text-xl font-bold leading-snug">
                                    ¿Por qué Coessa?
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Más de <span className="font-semibold text-primary">25 años</span> fabricando colchones en México. Materiales premium, hipoalergénicos y tecnología de soporte para mejorar la calidad del sueño.
                                </p>
                                <ul className="space-y-3 mt-8">
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M320 128C426 128 512 214 512 320C512 426 426 512 320 512C254.8 512 197.1 479.5 162.4 429.7C152.3 415.2 132.3 411.7 117.8 421.8C103.3 431.9 99.8 451.9 109.9 466.4C156.1 532.6 233 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C234.3 64 158.5 106.1 112 170.7L112 144C112 126.3 97.7 112 80 112C62.3 112 48 126.3 48 144L48 256C48 273.7 62.3 288 80 288L104.6 288C105.1 288 105.6 288 106.1 288L192.1 288C209.8 288 224.1 273.7 224.1 256C224.1 238.3 209.8 224 192.1 224L153.8 224C186.9 166.6 249 128 320 128zM344 216C344 202.7 333.3 192 320 192C306.7 192 296 202.7 296 216L296 320C296 326.4 298.5 332.5 303 337L375 409C384.4 418.4 399.6 418.4 408.9 409C418.2 399.6 418.3 384.4 408.9 375.1L343.9 310.1L343.9 216z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Durabilidad a largo plazo, no solo confort inicial</span>
                                    </li>
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Materiales hipoalergénicos y de alta calidad</span>
                                    </li>
                                    <li className="flex items-center gap-3  px-4 py-3 border border-border rounded-xl">
                                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                            <svg className="h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#3d4080" d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"></path></svg>
                                        </span>
                                        <span className="text-sm text-gray-600">Soluciones para hogar, hotelería e infantil</span>
                                    </li>
                                </ul>
                            </article>

                        </div>
                    </div>
                </div>
        </section >

            {/* Store FAQ Section */ }
            < section className = "py-16 bg-muted/30 hidden" >
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="shipping">
                            <AccordionTrigger>¿Cuáles son sus opciones de envío?</AccordionTrigger>
                            <AccordionContent>
                                Ofrecemos envío estándar (5-7 días hábiles), envío exprés (2-3 días hábiles) y entrega al día siguiente para áreas selectas. El envío estándar es gratuito en pedidos superiores a $50.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="returns">
                            <AccordionTrigger>¿Cuál es su política de devoluciones?</AccordionTrigger>
                            <AccordionContent>
                                Aceptamos devoluciones dentro de los 30 días posteriores a la compra. Los artículos deben estar sin usar y en su embalaje original. Simplemente contacte a nuestro equipo de soporte para iniciar una devolución y recibir una etiqueta de envío prepagada.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="tracking">
                            <AccordionTrigger>¿Cómo puedo rastrear mi pedido?</AccordionTrigger>
                            <AccordionContent>
                                Una vez que su pedido sea enviado, recibirá un correo electrónico con un número de seguimiento. También puede ver el estado de su pedido en cualquier momento iniciando sesión en su cuenta y visitando la sección de historial de pedidos.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="international">
                            <AccordionTrigger>¿Ofrecen envíos internacionales?</AccordionTrigger>
                            <AccordionContent>
                                ¡Sí! Enviamos a más de 50 países en todo el mundo. Las tarifas y los tiempos de entrega internacionales varían según la ubicación. Puede ver el costo exacto en la caja antes de completar su compra.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section >

    {/* {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )} */}
        </>
    );
}
