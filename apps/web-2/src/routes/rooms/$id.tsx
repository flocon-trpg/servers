import { RoomId } from '@/components/pages/room/RoomIdPage/RoomIdPage'
import { createFileRoute } from '@tanstack/react-router'

const Component = () => {
  const { id } = Route.useParams();
  return <RoomId id={id} />
}

export const Route = createFileRoute('/rooms/$id')({
  component: Component,
})
