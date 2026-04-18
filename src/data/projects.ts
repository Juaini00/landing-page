// src/data/projects.ts

export interface Project {
  i18nPrefix: string;
  tech: string[];
  layout: 'left' | 'right'; // left = text first, right = diagram first
  diagramHtml: string;
}

export const projects: Project[] = [
  {
    i18nPrefix: 'project.01',
    tech: ['Spring Boot', 'PostgreSQL', 'Redis'],
    layout: 'left',
    diagramHtml: `
      <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">API Gateway</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Event Service</span></div>
        <div class="ml-[110px]"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Auth · JWT</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">RBAC</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">Session · Redis</span></div>
        <div class="ml-10"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Participants</span><span class="text-ink-mute">·</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Activities</span><span class="text-ink-mute">·</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Groups</span></div>
        <div class="flex items-center gap-2.5 mt-1.5"><span class="text-ink-mute">Storage:</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">PostgreSQL</span></div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.02',
    tech: ['Jersey', 'AWS Lambda', 'MySQL'],
    layout: 'right',
    diagramHtml: `
      <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Order Event</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">λ dispatcher</span></div>
        <div class="ml-[90px]"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">λ legal-entity</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">λ warehouse-select</span></div>
        <div class="ml-[60px]"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Fulfillment Worker</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">MySQL</span></div>
        <div class="mt-1.5 text-ink-mute">// driven by seller-ownership config</div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.03',
    tech: ['Spring Boot', 'PostgreSQL', 'Secure REST'],
    layout: 'left',
    diagramHtml: `
      <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Client</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">REST /loans/pre-close</span></div>
        <div class="ml-[50px]"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">Interest Calc</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">Penalty Rules</span></div>
        <div class="ml-[50px]"><span class="text-ink-mute">↓</span></div>
        <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Txn Service</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">PostgreSQL</span></div>
        <div class="mt-1.5 text-ink-mute">// audited · idempotent · signed</div>
      </div>
    `,
  },
];
