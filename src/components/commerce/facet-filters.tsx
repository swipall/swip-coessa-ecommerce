'use client';

import { use } from 'react';
import type { SearchResult } from '@/lib/swipall/rest-adapter';
import { TaxonomyInterface } from '@/lib/swipall/types/types';

interface FacetFiltersProps {
    taxonomies: TaxonomyInterface[];
    searchParams: Record<string, string | string[] | undefined>;
}


/**
 * Facet filters for product search.
 * Currently returns null as the Swipall API doesn't support facet filtering
 * in the same way as Vendure.
 * 
 * This component is kept as a placeholder for future implementation.
 */
export function FacetFilters({ taxonomies, searchParams }: FacetFiltersProps) {

    const currentSelectedFilters = () => {
        const selected: string[] = [];
        for (const key in searchParams) {
            if (key.startsWith('taxonomy_value')) {
                const value = searchParams[key];
                if (typeof value === 'string') {
                    selected.push(value);
                } else if (Array.isArray(value)) {
                    selected.push(...value);
                }
            }
        }
        return selected;
    }

    const navigateToFacet = (taxonomy: TaxonomyInterface) => {
        // navigate to the same page with updated search params for the selected facet
        window.location.href = `?${new URLSearchParams({
            ...searchParams,
            'taxonomies__slug__and': taxonomy.slug,
            'taxonomy_value': taxonomy.value,
        } as Record<string, string>).toString()}`;
    }

    const onClearFilters = () => {
        // navigate to the same page with cleared facet search params
        const newSearchParams = { ...searchParams };
        delete newSearchParams['taxonomies__slug__and'];
        delete newSearchParams['taxonomy_value'];
        window.location.href = `?${new URLSearchParams(newSearchParams as Record<string, string>).toString()}`;
    }

    return (
        <div className="p-4 rounded-lg">
            {
                currentSelectedFilters().length > 0 && (
                    <div className="mb-4 w-full border-b border-gray-300 pb-4 justify-between items-center">
                        <p className="text-sm font-semibold mb-2">Filtrando por:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {currentSelectedFilters().map((filter) => (
                                <li key={filter} className="text-black">
                                    <div className='flex flex-row justify-between items-center'>
                                        {filter}
                                        <button
                                            onClick={() => onClearFilters()}
                                            className="ml-2 text-red-500 hover:text-red-700 transition-colors p-2"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
            {
                taxonomies.length > 0 ? (
                    <div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {taxonomies.map((taxonomy) => (
                                <li key={taxonomy.id} className="text-black">
                                    <a onClick={() => navigateToFacet(taxonomy)} className="cursor-pointer hover:text-foreground transition-colors">
                                        {taxonomy.value}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    null
                )
            }
        </div>
    );
}
