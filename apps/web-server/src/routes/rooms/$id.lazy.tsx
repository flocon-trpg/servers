import { createLazyFileRoute } from '@tanstack/react-router';
import { RoomId } from '@/components/pages/room/RoomIdPage/RoomIdPage';

const Component = () => {
    const { id } = Route.useParams();
    return <RoomId id={id} />;
};

export const Route = createLazyFileRoute('/rooms/$id')({
    component: Component,
});
