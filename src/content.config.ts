import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per locale; every visible string on the site lives here.
const site = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/site' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    lede: z.string(),
    availability: z.string(),
    contactCta: z.string(),
    skip: z.string(),
    cv: z.object({ label: z.string(), href: z.string() }),
    nav: z.array(z.object({ label: z.string(), href: z.string() })),
    switchLocale: z.object({ label: z.string(), href: z.string(), lang: z.string() }),
    theme: z.object({ toDark: z.string(), toLight: z.string() }),
    deploy: z.object({ label: z.string(), commit: z.string(), build: z.string(), ok: z.string(), deploy: z.string() }),
    about: z.object({
      heading: z.string(),
      paragraph: z.string(),
      facts: z.array(z.object({ label: z.string(), value: z.string() })),
      skills: z.array(z.object({ label: z.string(), items: z.array(z.string()) })),
    }),
    experience: z.object({
      heading: z.string(),
      items: z.array(z.object({ company: z.string(), role: z.string(), period: z.string(), summary: z.string(), highlights: z.array(z.string()), stack: z.array(z.string()) })),
    }),
    work: z.object({
      heading: z.string(),
      featured: z.array(z.object({
        title: z.string(), kind: z.string(), summary: z.string(),
        stages: z.array(z.object({ label: z.string(), text: z.string() })),
        facts: z.array(z.object({ label: z.string(), value: z.string() })),
        href: z.string().optional(),
      })),
      sideHeading: z.string(),
      side: z.array(z.object({ title: z.string(), summary: z.string(), stack: z.array(z.string()), demo: z.string().optional(), code: z.string() })),
      demoLabel: z.string(),
      codeLabel: z.string(),
    }),
    contact: z.object({
      heading: z.string(),
      lead: z.string(),
      rows: z.array(z.object({ label: z.string(), value: z.string(), href: z.string() })),
    }),
    footer: z.object({ rights: z.string() }),
  }),
});

export const collections = { site };
