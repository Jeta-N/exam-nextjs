import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { FoodItemDetailModel, examNextJsClient } from '@/functions/swagger/examNextJSClient';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { useAuthorizationContext } from '@/functions/AuthorizationContext';
import { Authorize } from '@/components/Authorize';
import { useState } from 'react';
import { notification } from 'antd';


const FoodItemDisplayItem: React.FC<{
    foodItem: FoodItemDetailModel
}> = ({ foodItem }) => {

    // Masih salah buat setQuantity kalo udah ada isi di database.
    const [quantity, setQuantity] = useState(1);
    const minQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity - 1);
    }
    const addQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    }

    const { accessToken } = useAuthorizationContext();

    async function addToCart() {
        const client = new examNextJsClient('http://localhost:3000/api/be', {
            fetch(url, init) {
                if (init && init.headers) {
                    init.headers['Authorization'] = `Bearer ${accessToken}`
                }
                return fetch(url, init);
            }
        });
        try {
            const cart = await client.addToCart({
                restaurantId: foodItem.restaurantId
            });

            const cartId = cart.id
            await client.addToCartDetail({
                cartId: cartId,
                foodItemId: foodItem.id,
                quantity: quantity
            })

            notification.success({
                type: 'success',
                placement: 'bottomRight',
                message: 'Added to cart',
                description: `Added ${quantity} ${foodItem.name} to cart`
            });

            window.history.back()
        } catch (err) {
            notification.error({
                type: 'error',
                placement: 'bottomRight',
                message: 'Failed to add to cart',
                description: String(err)
            });
        }
    }

    return (
        <>
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b w-full border-gray-300">
                <div className="w-24 h-24 mr-4">
                    <div className="w-full h-full object-cover rounded bg-slate-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{foodItem.name}</h3>
                    <p className="text-gray-600">Rp.{foodItem.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                    <button className="border border-gray-400 rounded-l px-3 py-2 bg-gray-200 hover:bg-gray-300"
                        onClick={minQuantity} type='button'>
                        -
                    </button>
                    <span className="mx-2">{quantity}</span>
                    <button className="border border-gray-400 rounded-r px-3 py-2 bg-gray-200 hover:bg-gray-300"
                        onClick={addQuantity} type='button'>
                        +
                    </button>
                </div>
            </div>
            <div className='flex justify-end p-4'>
                <button type='button' onClick={addToCart} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Add to Cart</button>
            </div>
        </>
    );
};

const InnerIndexPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const fetcher = useSwrFetcherWithAccessToken();
    const foodItemUri = id ? `/api/be/api/FoodItems/${id}` : undefined;
    const { data } = useSwr<FoodItemDetailModel>(foodItemUri, fetcher);

    function renderFood() {
        if (!id || !data || typeof id !== 'string') {
            return;
        }

        return (
            <FoodItemDisplayItem foodItem={data} />
        );
    }

    return (
        <div>
            <Title>Home</Title>
            <div>
                <Link href="/">
                    <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                    Back to home
                </Link>
            </div>
            {renderFood()}
        </div>
    );
}

const IndexPage: Page = () => {
    return (
        <Authorize>
            <InnerIndexPage></InnerIndexPage>
        </Authorize>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
