import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { fetchTosAtom, tosFileName } from '@/atoms/fetchTosAtom/fetchTosAtom';
import { TextPage } from '@/components/pages/TextPage/TextPage';

const Component: React.FC = () => {
    const text = useAtomValue(fetchTosAtom);
    return <TextPage text={text} filename={tosFileName} />;
};

export const Route = createFileRoute('/text/tos')({
    component: Component,
});
