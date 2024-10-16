import { ProfilePage } from '@/components/pages/ProfilePage/ProfilePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/profile')({
    component: ProfilePage,
});
