import { IndexPage } from '@/components/pages/IndexPage/IndexPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: IndexPage,
});
