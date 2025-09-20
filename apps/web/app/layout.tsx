export const metadata = {
  title: "NourishIQ",
  description: "NourishIQ — Advanced Nutrition"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fafafa" }}>{children}</body>
    </html>
  )
}
