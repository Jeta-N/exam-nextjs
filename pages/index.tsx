import { WithDefaultLayout } from '../components/DefautLayout';
import { Title } from '../components/Title';
import { Page } from '../types/Page';
// import { Authorize } from '@/components/Authorize';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { Restaurant } from '@/functions/swagger/examNextJSClient';
import Link from 'next/link';

const RestaurantDisplayItem: React.FC<{
    restaurant: Restaurant
}> = ({ restaurant }) => {
    const foodUri = `restaurant/${restaurant.id}`
    return (
        <Link href={foodUri} className='border border-gray-400 rounded-xl p-6 flex flex-col items-center bg-white shadow-lg'>
            <div className='bg-slate-400 h-[160px] w-full'></div>
            <div className='mt-4 font-bold'>{restaurant.name}</div>
        </Link>
    );
};

const InnerIndexPage: React.FC = () => {
    const fetcher = useSwrFetcherWithAccessToken();
    const { data } = useSwr<Restaurant[]>('/api/be/api/restaurants', fetcher);

    return (
        <div>
            <Title>Home</Title>
            <div className='grid grid-cols-4 gap-5'>
                {data?.map((x, i) => <RestaurantDisplayItem key={i} restaurant={x} />)}
            </div>
        </div>
    );
}

const IndexPage: Page = () => {
    return (
        // <Authorize>
        <InnerIndexPage></InnerIndexPage>
        // </Authorize>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
