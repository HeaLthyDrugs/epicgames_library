export const metadata = {
  title: 'Epic Games Library',
  description: 'View and manage your Epic Games Library',
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
} 