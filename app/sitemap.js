import { getProjects } from '@/lib/data';

export default async function sitemap() {
  // Use the vercel URL or fallback
  const baseUrl = 'https://kiran-portfolio-eight.vercel.app';

  let projects = [];
  try {
    projects = await getProjects();
  } catch (error) {
    console.error('Failed to fetch projects for sitemap', error);
  }
  
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
