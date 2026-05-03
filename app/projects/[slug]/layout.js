import { getProjectBySlug } from '@/lib/data';

export async function generateMetadata({ params }) {
    try {
        const resolvedParams = await params;
        const project = await getProjectBySlug(resolvedParams.slug);
        
        if (!project) {
            return {
                title: 'Project Not Found | Mahendra Kirana',
            };
        }

        const title = `${project.title_en} | Mahendra Kirana`;
        const description = project.description_en || `View details about the ${project.title_en} project built by Mahendra Kirana.`;
        
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                images: project.image_url && project.image_url !== '#' ? [{ url: project.image_url }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: project.image_url && project.image_url !== '#' ? [project.image_url] : [],
            }
        };
    } catch (e) {
        return {
            title: 'Project | Mahendra Kirana',
        };
    }
}

export default function ProjectLayout({ children }) {
    return children;
}
