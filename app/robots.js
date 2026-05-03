export default function robots() {
  const baseUrl = 'https://kiran-portfolio-eight.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Hide admin dashboard from search engines
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
