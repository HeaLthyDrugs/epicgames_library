export const metadata = {
  title: 'Epic Games Library',
  description: 'View and manage your Epic Games Library, share with friends, and lend games.',
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 