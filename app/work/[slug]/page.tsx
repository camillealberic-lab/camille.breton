import { notFound } from 'next/navigation';
import { projects, getProjectBySlug, getNextProject } from '@/lib/projects';
import ProjectDetail from './ProjectDetail';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Camille Breton`,
    description: project.shortDesc,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const nextProject = getNextProject(params.slug);
  return <ProjectDetail key={params.slug} project={project} nextProject={nextProject} />;
}
