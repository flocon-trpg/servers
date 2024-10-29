import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { envTxtFileName, fetchEnvTxtAtom } from '@/atoms/fetchEnvTxtAtom/fetchEnvTxtAtom';
import { TextPage } from '@/components/pages/TextPage/TextPage';

const Component: React.FC = () => {
    const text = useAtomValue(fetchEnvTxtAtom);
    return <TextPage text={text} filename={envTxtFileName} />;
};

export const Route = createFileRoute('/text/env')({
    component: Component,
});
