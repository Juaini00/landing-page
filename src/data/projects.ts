// src/data/projects.ts

export interface ProjectLink {
  href: string;
  labelI18n: string;
  tone?: 'primary' | 'secondary';
}

export interface Project {
  i18nPrefix: string;
  tech: string[];
  layout: 'left' | 'right'; // left = text first, right = diagram first
  diagramHtml: string;
  statusI18nKey?: string;
  demoI18nKey?: string;
  links?: ProjectLink[];
}

export const projects: Project[] = [
  {
    i18nPrefix: 'project.01',
    tech: ['Rust', 'PostgreSQL', 'Redis', 'pgvector'],
    layout: 'left',
    statusI18nKey: 'project.01.status',
    links: [
      {
        href: 'https://github.com/Juaini00/fineract-ai-reports',
        labelI18n: 'project.link.source',
        tone: 'primary',
      },
    ],
    diagramHtml: `
      <div class="project-diagram">
        <div class="console-steps" aria-label="Fineract AI Reports runtime flow">
          <div class="console-step accent"><span>01</span><b>Natural language</b></div>
          <div class="console-arrow">-&gt;</div>
          <div class="console-step"><span>02</span><b>Router</b></div>
          <div class="console-step violet"><span>03</span><b>Planner</b></div>
          <div class="console-arrow">-&gt;</div>
          <div class="console-step green"><span>04</span><b>Policy gate</b></div>
          <div class="console-step"><span>05</span><b>Approved SQL</b></div>
          <div class="console-arrow">-&gt;</div>
          <div class="console-step accent"><span>06</span><b>Structured report</b></div>
        </div>
        <div class="console-note">// AI never writes SQL · read-only execution · audited jobs</div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.02',
    tech: ['Laravel', 'Inertia', 'React', 'PostgreSQL'],
    layout: 'right',
    statusI18nKey: 'project.02.status',
    demoI18nKey: 'project.02.demo',
    links: [
      {
        href: 'https://hris-mini-production-bvwjdi.laravel.cloud/',
        labelI18n: 'project.link.demo',
        tone: 'primary',
      },
      {
        href: 'https://github.com/Juaini00/HRIS-Mini',
        labelI18n: 'project.link.source',
      },
    ],
    diagramHtml: `
      <div class="project-diagram">
        <div class="console-steps" aria-label="NusaHR workflow map">
          <div class="console-step accent"><span>01</span><b>RBAC</b></div>
          <div class="console-arrow">-&gt;</div>
          <div class="console-step"><span>02</span><b>Employees</b></div>
          <div class="console-step"><span>03</span><b>Org data</b></div>
          <div class="console-arrow">+</div>
          <div class="console-step violet"><span>04</span><b>Leave · Attendance · Payroll</b></div>
          <div class="console-step"><span>05</span><b>Reports</b></div>
          <div class="console-arrow">-&gt;</div>
          <div class="console-step green"><span>06</span><b>Audit-safe exports</b></div>
        </div>
        <div class="console-note">// demo roles · transactional workflows · policy-backed screens</div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.03',
    tech: ['Spring Boot', 'PostgreSQL', 'Redis'],
    layout: 'left',
    diagramHtml: `
      <div class="project-diagram">
        <div class="console-flow" aria-label="Enterprise event platform architecture">
          <div class="console-flow-row"><span class="console-flow-node accent">API Gateway</span><span class="console-flow-mark">-&gt;</span><span class="console-flow-node">Event Service</span></div>
          <div class="console-flow-row indent"><span class="console-flow-node">Auth · JWT</span><span class="console-flow-mark">+</span><span class="console-flow-node violet">RBAC</span><span class="console-flow-mark">+</span><span class="console-flow-node green">Session · Redis</span></div>
          <div class="console-flow-row"><span class="console-flow-node">Participants</span><span class="console-flow-mark">·</span><span class="console-flow-node">Activities</span><span class="console-flow-mark">·</span><span class="console-flow-node">Groups</span></div>
          <div class="console-flow-row storage"><span class="console-flow-label">Storage</span><span class="console-flow-node green">PostgreSQL</span></div>
        </div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.04',
    tech: ['Jersey', 'AWS Lambda', 'MySQL'],
    layout: 'right',
    diagramHtml: `
      <div class="project-diagram">
        <div class="console-flow" aria-label="Fulfillment event architecture">
          <div class="console-flow-row"><span class="console-flow-node">Order Event</span><span class="console-flow-mark">-&gt;</span><span class="console-flow-node accent">lambda dispatcher</span></div>
          <div class="console-flow-row indent"><span class="console-flow-node violet">legal-entity</span><span class="console-flow-mark">+</span><span class="console-flow-node violet">warehouse-select</span></div>
          <div class="console-flow-row"><span class="console-flow-node">Fulfillment Worker</span><span class="console-flow-mark">-&gt;</span><span class="console-flow-node green">MySQL</span></div>
        </div>
        <div class="console-note">// driven by seller-ownership config</div>
      </div>
    `,
  },
  {
    i18nPrefix: 'project.05',
    tech: ['Spring Boot', 'PostgreSQL', 'Secure REST'],
    layout: 'left',
    diagramHtml: `
      <div class="project-diagram">
        <div class="console-flow" aria-label="Loan pre-closure service flow">
          <div class="console-flow-row"><span class="console-flow-node">Client</span><span class="console-flow-mark">-&gt;</span><span class="console-flow-node accent">REST /loans/pre-close</span></div>
          <div class="console-flow-row indent"><span class="console-flow-node violet">Interest Calc</span><span class="console-flow-mark">+</span><span class="console-flow-node violet">Penalty Rules</span></div>
          <div class="console-flow-row"><span class="console-flow-node">Txn Service</span><span class="console-flow-mark">-&gt;</span><span class="console-flow-node green">PostgreSQL</span></div>
        </div>
        <div class="console-note">// audited · idempotent · signed</div>
      </div>
    `,
  },
];
