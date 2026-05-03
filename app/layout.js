import './globals.css';

export const metadata = {
  title: 'Mahendra Kirana | Backend Developer',
  description: 'Backend Developer Portfolio - Projects, Skills, and Experience of Mahendra Kirana M.B',
  keywords: ['Mahendra Kirana', 'portfolio', 'backend developer', 'software engineer', 'API', 'database', 'Node.js', 'Go'],
  openGraph: {
    title: 'Mahendra Kirana | Backend Developer',
    description: 'Backend Developer Portfolio - Projects, Skills, and Experience of Mahendra Kirana M.B',
    type: 'website',
    locale: 'en_US',
    siteName: 'Mahendra Kirana Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mahendra Kirana | Backend Developer',
    description: 'Backend Developer Portfolio - Projects, Skills, and Experience',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
