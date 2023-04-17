import { WithDefaultLayout } from '../components/DefautLayout';
import { Title } from '../components/Title';
import { Page } from '../types/Page';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const IndexPage: Page = () => {
    return (
        <div>
            <Title>Home</Title>
            <div className='w-full flex items-center justify-center flex-col h-96'>
                <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#1eff00", fontSize: 72 }} />
                <h1 className='fa-3x font-bold'>Thank you for using GripFood</h1>
                <Link href='/' className='bg-blue-500 mt-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Back to home</Link>
            </div>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
