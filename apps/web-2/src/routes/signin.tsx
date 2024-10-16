import { SignIn } from '@/components/models/auth/SignIn/SignIn'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
  component: SignIn,
})
