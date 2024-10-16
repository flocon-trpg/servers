import { createFileRoute } from '@tanstack/react-router'
import { RoomCreatePage } from '../../components/pages/room/RoomCreatePage/RoomCreatePage'

export const Route = createFileRoute('/rooms/create')({
  component: RoomCreatePage,
})
