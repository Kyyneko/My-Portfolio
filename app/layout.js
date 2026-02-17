import './globals.css';

export const metadata = {
  title: 'Portfolio | Developer',
  description: 'Full Stack Developer Portfolio - Projects, Skills, and Experience',
  keywords: ['portfolio', 'developer', 'full stack', 'web developer', 'software engineer'],
  openGraph: {
    title: 'Portfolio | Developer',
    description: 'Full Stack Developer Portfolio - Projects, Skills, and Experience',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
