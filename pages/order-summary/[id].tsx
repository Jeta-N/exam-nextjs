import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { CartDetailModel, CartItemModel } from '@/functions/swagger/examNextJSClient';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faRemove } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { useAuthorizationContext } from '@/functions/AuthorizationContext';
import { Authorize } from '@/components/Authorize';
// import { notification } from 'antd


const RenderCartItems: React.FC<{ cartDetail: CartDetailModel }> = ({ cartDetail }) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b w-full border-gray-300">
            <div className="w-24 h-24 mr-4">
                <div className="w-full h-full object-cover rounded bg-slate-400" />
            </div>
            <div className="flex-1">
                <h3 className="font-medium text-gray-800">{cartDetail.foodItemId}</h3>
                {/* <p className="text-gray-600">Rp.{foodItem.price?.toLocaleString()}</p> */}
                <p>Quantity: {cartDetail.quantity}</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
                <Link href={`/add-to-cart/${cartDetail.cartId}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faEdit}></FontAwesomeIcon>
                    Edit
                </Link>
                <button className="ml-1 py-1 px-2 text-xs bg-red-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faRemove}></FontAwesomeIcon>
                    Delete
                </button>
            </div>
        </div>
    );
}

const FoodItemDisplayItem: React.FC<{
    cart: CartItemModel
}> = ({ cart }) => {
    const fetcher = useSwrFetcherWithAccessToken();
    const cartUri = `/api/be/api/CartDetails?cartId=${cart[0].id}`
    const { data } = useSwr<CartDetailModel[]>(cartUri, fetcher);

    return (
        <div>
            {data?.map((x, i) => <RenderCartItems key={i} cartDetail={x} />)}
        </div>
    );
};

const InnerIndexPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const fetcher = useSwrFetcherWithAccessToken();
    const cartUri = id ? `/api/be/api/Carts?restaurantId=${id}` : undefined;
    const { data } = useSwr<CartItemModel>(cartUri, fetcher);

    function renderFood() {
        if (!id || !data || typeof id !== 'string') {
            return;
        }

        return (
            <FoodItemDisplayItem cart={data} />
        );
    }

    const menuUri = `/restaurant/${id}`

    return (
        <div>
            <Title>Home</Title>
            <div>
                <Link href={menuUri}>
                    <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                    Back to menu
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
