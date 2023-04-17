import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { CartDetailModel, CartItemModel, FoodItemDataGridModel } from '@/functions/swagger/examNextJSClient';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { useAuthorizationContext } from '@/functions/AuthorizationContext';
// import { Authorize } from '@/components/Authorize';


const FoodItemDisplayItem: React.FC<{
    foodItem: FoodItemDataGridModel
}> = ({ foodItem }) => {
    const addToCartUri = `/add-to-cart/${foodItem.id}`

    return (
        <Link href={addToCartUri} className='border border-gray-400 rounded-xl p-6 flex flex-col items-center bg-white shadow-lg'>
            <div className='bg-slate-400 h-[160px] w-full'></div>
            <div className='mt-4 font-bold'>{foodItem.name}</div>
            <div className='mt-4'>Rp.{foodItem.price?.toLocaleString()}</div>
        </Link>
    );
};

//Error Get Price
// const GetPrice = (foodId: string) => {
//     const fetcher = useSwrFetcherWithAccessToken();
//     const foodItemUri = `/api/be/api/FoodItems/${foodId}`;
//     const { data } = useSwr<FoodItemDetailModel>(foodItemUri, fetcher);

//     if (!data) {
//         return 0;
//     }

//     return data.price;
// }


const RenderCheckOut: React.FC<{ cart: CartItemModel }> = ({ cart }) => {

    const fetcher = useSwrFetcherWithAccessToken();
    const cartId = cart[0].id;
    const cartDetailUri = cartId ? `/api/be/api/CartDetails?cartId=${cartId}` : undefined;
    const { data } = useSwr<CartDetailModel[]>(cartDetailUri, fetcher);
    const countItems = () => {
        let count = 0;
        data?.forEach((item) => {
            if (item.quantity) {
                count += item.quantity
            }
        });
        return count;
    }

    // Error ga bisa dapet price per foodItem.
    const countPrice = () => {
        let totalPrice = 0;
        data?.forEach((item) => {
            if (item.foodPrice) {
                totalPrice += item.foodPrice
            }
        });
        return totalPrice;
    }

    const orderSummaryUri = `/order-summary/${cart[0].restaurantId}`

    return (
        <div className="flex items-center px-6 justify-between bottom-0 fixed left-0 py-[30px] shadow-gray-700 shadow-lg bg-white w-full">
            <div>
                <h3 className='fa-xl'>Current cart</h3>
            </div>
            <div className='flex items-center'>
                <h3 className='mr-3 fa-xl'>Total item: {countItems()}</h3>
                <h3 className='mr-3 fa-xl'>Total Price: {countPrice()}</h3>
                <Link href={orderSummaryUri} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>CheckOut</Link>
            </div>
        </div>
    )
}

const CheckOutSection: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const fetcher = useSwrFetcherWithAccessToken();
    const cartUri = id ? `/api/be/api/Carts?restaurantId=${id}` : undefined;
    const { data } = useSwr<CartItemModel>(cartUri, fetcher);
    if (data === undefined) {
        return <></>
    }
    if (data[0] === undefined) {
        return <></>
    }
    if (data[0].id === undefined) {
        return <></>
    }
    return (
        <RenderCheckOut cart={data} ></RenderCheckOut >
    )
}

const InnerIndexPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const fetcher = useSwrFetcherWithAccessToken();
    const foodItemUri = id ? `/api/be/api/FoodItems?restaurantId=${id}` : undefined;
    const { data } = useSwr<FoodItemDataGridModel[]>(foodItemUri, fetcher);

    return (
        <div>
            <Title>Home</Title>
            <div>
                <Link href="/">
                    <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                    Back to home
                </Link>
            </div>
            <div className='grid grid-cols-5 gap-5'>
                {data?.map((x, i) => <FoodItemDisplayItem key={i} foodItem={x} />)}
            </div>
            <CheckOutSection></CheckOutSection>
        </div>
    );
}

const IndexPage: Page = () => {
    return (
        <InnerIndexPage></InnerIndexPage>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
