// /llms.txt: a plain-markdown version of the site for AI agents (https://llmstxt.org), from the same content file.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

export const GET: APIRoute = async ({ site: base }) => {
  const site = (await getEntry('site', 'en'))!.data;
  const abs = (path: string) => new URL(path, base).href;
  const { about, experience, work, contact } = site;

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description} ${site.availability}`,
    '',
    about.paragraph,
    '',
    `- Website: ${abs('/')} (English), ${abs('/es/')} (Spanish)`,
    `- CV (PDF): ${abs('/cv-en.pdf')} (English), ${abs('/cv-es.pdf')} (Spanish)`,
    ...contact.rows.filter((row) => !row.href.endsWith('.pdf')).map((row) => `- ${row.label}: ${row.href.replace('mailto:', '')}`),
    ...about.facts.map((fact) => `- ${fact.label}: ${fact.value}`),
    '',
    `## ${experience.heading}`,
    ...experience.items.flatMap((job) => [
      '',
      `### ${job.role}, ${job.company} (${job.period})`,
      job.summary,
      ...job.highlights.map((item) => `- ${item}`),
      `- Stack: ${job.stack.join(', ')}`,
    ]),
    '',
    `## ${work.heading}`,
    ...work.featured.flatMap((project) => [
      '',
      `### ${project.title} (${project.kind})`,
      project.summary,
      ...project.stages.map((stage) => `- ${stage.label}: ${stage.text}`),
      ...project.facts.map((fact) => `- ${fact.label}: ${fact.value}`),
      ...(project.demo ? [`- Demo: ${project.demo}`] : []),
      ...(project.code ? [`- Code: ${project.code}`] : []),
    ]),
    '',
    `### ${work.sideHeading}`,
    ...work.side.map((p) => `- ${p.title}: ${p.summary} (${p.stack.join(', ')}) ${p.code}`),
    '',
    `## ${about.skillsHeading}`,
    ...about.skills.map((group) => `- ${group.label}: ${group.items.join(', ')}`),
    '',
    `## ${about.education.heading}`,
    ...about.education.items.map((edu) => `- ${edu.title}, ${edu.school} (${edu.period})`),
    '',
    `## ${about.languages.heading}`,
    ...about.languages.items.map((item) => `- ${item.label}: ${item.value}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
