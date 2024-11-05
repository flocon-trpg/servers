import { createFileRoute } from '@tanstack/react-router';
import { RoomIndexPage } from '../../components/pages/room/RoomIndexPage/RoomIndexPage';

export const Route = createFileRoute('/rooms/')({
    component: RoomIndexPage,
});
