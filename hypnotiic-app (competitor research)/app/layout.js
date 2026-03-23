import './globals.css'

export const metadata = {
  title: 'Hypnotiic Media — Internal',
  description: 'Internal tools for Hypnotiic Media',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
