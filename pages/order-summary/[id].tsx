import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { CartDetailModel, CartItemModel, examNextJsClient } from '@/functions/swagger/examNextJSClient';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faRemove } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { useAuthorizationContext } from '@/functions/AuthorizationContext';
import { Authorize } from '@/components/Authorize';
import { Modal, notification } from 'antd';
// import { notification } from 'antd


const RenderCheckOut: React.FC<{ cart: CartItemModel, onDeleted: () => void }> = ({ cart, onDeleted }) => {

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

    function orderNow() {
        Modal.confirm({
            title: `Confirm Order`,
            content: `Are You Sure To Order all food?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                // masuk ke sini error
                if (!cart?.id) {
                    // console.log("masuk")
                    return;
                }
                try {
                    const client = new examNextJsClient('http://localhost:3000/api/be');
                    //harusnya hapus cart detailnya juga
                    await client.cartsDELETE(cart.id);
                    onDeleted();
                    notification.success({
                        type: 'success',
                        placement: 'bottomRight',
                        message: 'Order successfully',
                        description: `Order successfully`
                    });
                } catch (err) {
                    console.error(err);
                    notification.error({
                        type: 'error',
                        placement: 'bottomRight',
                        message: 'Failed to order food',
                        description: `Failed to order food`
                    });
                }
            },
        });
    }

    return (
        <div className="flex items-center px-6 justify-between bottom-0 fixed left-0 py-[30px] shadow-gray-700 shadow-lg bg-white w-full">
            <div>
                <h3 className='fa-xl'>Current cart</h3>
            </div>
            <div className='flex items-center'>
                <h3 className='mr-3 fa-xl'>Total item: {countItems()}</h3>
                <h3 className='mr-3 fa-xl'>Total Price: {countPrice()}</h3>
                <button onClick={orderNow} type='button' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Order Now</button>
            </div>
        </div>
    )
}
const RenderCartItems: React.FC<{ cartDetail: CartDetailModel, onDeleted: () => void }> = ({ cartDetail, onDeleted }) => {


    function onClickDelete() {
        Modal.confirm({
            title: `Confirm Delete`,
            content: `Are You Sure To Delete This Food?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                if (!cartDetail?.id) {
                    return;
                }
                try {
                    const client = new examNextJsClient('http://localhost:3000/api/be');
                    await client.cartDetailsDELETE(cartDetail.id);
                    onDeleted();
                    notification.success({
                        type: 'success',
                        placement: 'bottomRight',
                        message: 'Food deleted successfully',
                        description: `Food deleted successfully`
                    });
                } catch (err) {
                    console.error(err);
                    notification.error({
                        type: 'error',
                        placement: 'bottomRight',
                        message: 'Failed to delete food',
                        description: `Failed to delete food`
                    });

                    // Delete gagal karena Id nya sama? tidak sempet debug, saat POST id cartDetail dan CartId sama.
                    // coba hit pake swagger juga gagal not found
                }
            },
        });
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b w-full border-gray-300">
            <div className="w-24 h-24 mr-4">
                <div className="w-full h-full object-cover rounded bg-slate-400" />
            </div>
            <div className="flex-1">
                <h3 className="font-medium text-gray-800">{cartDetail.foodName}</h3>
                {/* <p className="text-gray-600">Rp.{foodItem.price?.toLocaleString()}</p> */}
                <p>Quantity: {cartDetail.quantity}</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
                <Link href={`/add-to-cart/${cartDetail.foodItemId}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faEdit}></FontAwesomeIcon>
                    Edit
                </Link>
                <button onClick={onClickDelete} className="ml-1 py-1 px-2 text-xs bg-red-500 text-white rounded-lg">
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
    const { data, mutate } = useSwr<CartDetailModel[]>(cartUri, fetcher);

    return (
        <div>
            {data?.map((x, i) => <RenderCartItems key={i} cartDetail={x} onDeleted={() => mutate()} />)}
        </div>
    );
};

const InnerIndexPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const fetcher = useSwrFetcherWithAccessToken();
    const cartUri = id ? `/api/be/api/Carts?restaurantId=${id}` : undefined;
    const { data, mutate } = useSwr<CartItemModel>(cartUri, fetcher);

    function renderFood() {
        if (!id || !data || typeof id !== 'string') {
            return;
        }

        return (
            <>
                <FoodItemDisplayItem cart={data} />
                <RenderCheckOut cart={data} onDeleted={() => mutate()} ></RenderCheckOut >
            </>
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
