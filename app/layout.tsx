import "../styles/globals.css";

export const metadata = {
  title: 'Payment Flow',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <>
          {children}
        </>
      </body>
    </html>
  );
}
