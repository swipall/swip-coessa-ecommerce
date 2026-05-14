import { SearchTermSkeleton } from '@/app/search/search-term';
import { SearchResultsSkeleton } from '@/components/shared/skeletons/search-results-skeleton';

export default function SearchLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
            <SearchTermSkeleton />
            <SearchResultsSkeleton />
        </div>
    );
}
