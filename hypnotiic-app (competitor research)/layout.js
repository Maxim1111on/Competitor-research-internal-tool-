import './globals.css'

export const metadata = {
  title: 'Hypnotiic Media',
  description: 'Internal tools',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
