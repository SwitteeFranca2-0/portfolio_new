export const dynamic = 'force-dynamic'

// Override the admin layout for the login page — no sidebar, full screen
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
