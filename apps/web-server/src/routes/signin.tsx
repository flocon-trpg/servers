import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@/components/models/auth/SignIn/SignIn';

export const Route = createFileRoute('/signin')({
    component: SignIn,
});
