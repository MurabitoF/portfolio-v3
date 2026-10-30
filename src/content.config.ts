import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per locale; every visible string on the site lives here.
// Strict objects: an unknown key (e.g. an unquoted comma inside `{ }` in YAML) fails the build instead of dropping text.
const site = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/site' }),
  schema: z.strictObject({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    lede: z.string(),
    availability: z.string(),
    contactCta: z.string(),
    skip: z.string(),
    cv: z.strictObject({ label: z.string(), href: z.string() }),
    nav: z.array(z.strictObject({ label: z.string(), href: z.string() })),
    switchLocale: z.strictObject({ label: z.string(), href: z.string(), lang: z.string() }),
    theme: z.strictObject({ toDark: z.string(), toLight: z.string() }),
    deploy: z.strictObject({ label: z.string(), commit: z.string(), build: z.string(), ok: z.string(), deploy: z.string() }),
    about: z.strictObject({
      heading: z.string(),
      paragraph: z.string(),
      facts: z.array(z.strictObject({ label: z.string(), value: z.string() })),
      skills: z.array(z.strictObject({ label: z.string(), items: z.array(z.string()) })),
    }),
    experience: z.strictObject({
      heading: z.string(),
      items: z.array(z.strictObject({ company: z.string(), role: z.string(), period: z.string(), summary: z.string(), highlights: z.array(z.string()), stack: z.array(z.string()) })),
    }),
    work: z.strictObject({
      heading: z.string(),
      featured: z.array(z.strictObject({
        title: z.string(), kind: z.string(), summary: z.string(),
        stages: z.array(z.strictObject({ label: z.string(), text: z.string() })),
        facts: z.array(z.strictObject({ label: z.string(), value: z.string() })),
        href: z.string().optional(),
      })),
      sideHeading: z.string(),
      side: z.array(z.strictObject({ title: z.string(), summary: z.string(), stack: z.array(z.string()), demo: z.string().optional(), code: z.string() })),
      demoLabel: z.string(),
      codeLabel: z.string(),
    }),
    contact: z.strictObject({
      heading: z.string(),
      lead: z.string(),
      rows: z.array(z.strictObject({ label: z.string(), value: z.string(), href: z.string() })),
    }),
    footer: z.strictObject({ rights: z.string() }),
  }),
});

export const collections = { site };
