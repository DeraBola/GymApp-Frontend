import styles from './page.module.css';
import { APP_NAME, APP_URL } from '../lib/brand';

const features = [
  { icon: '👤', title: 'Members & plans', text: 'Register members at the front desk, track their status, and offer monthly, quarterly or annual plans.' },
  { icon: '💳', title: 'Paystack payments', text: 'Send a member a checkout link, then verify the payment when it lands. Every payment is on record.' },
  { icon: '🧑‍💼', title: 'Staff & classes', text: 'Keep a record of your trainers and front desk, and schedule classes with an instructor and capacity.' },
  { icon: '🏋️', title: 'Equipment & repairs', text: 'Know what you own and when you bought it, and log every repair until the machine is back in use.' },
  { icon: '💎', title: 'Inventory & sales', text: 'Stock drinks, supplements and merch, record sales with totals worked out for you, and see revenue for any date range.' },
  { icon: '📍', title: 'Branches', text: 'Run several locations under one gym, each with its own address and contact number.' },
  { icon: '🛡️', title: 'Roles & permissions', text: 'Decide who can manage members, staff or users. Give the front desk only what they need.' },
  { icon: '✦', title: 'Dashboard at a glance', text: 'Members, plans, payments and sales for the month on one screen, with a checklist to get a new gym ready.' },
];

const steps = [
  { title: 'Create your gym', text: 'Add the gym and its branches. Each gym is its own workspace with its own data.' },
  { title: 'Set up plans and staff', text: 'Add membership plans and the people who work there, then give each person a role.' },
  { title: 'Register members', text: 'Sign up members at the front desk and assign them a plan.' },
  { title: 'Collect and track', text: 'Request payments, record shop sales, and watch the month’s numbers on the dashboard.' },
];

const roles = [
  {
    name: 'Super Admin',
    who: 'For the platform owner',
    points: ['Sees every gym and switches between them', 'Creates gyms and their first admins', 'Defines roles and what each can do'],
  },
  {
    name: 'Gym Admin',
    who: 'For a gym’s manager',
    points: ['Runs one gym and all its branches', 'Adds staff, members and users for that gym', 'Never sees another gym’s data'],
  },
  {
    name: 'Staff',
    who: 'For the front desk and trainers',
    points: ['Works inside their own gym only', 'Gets only the access their role allows', 'Simple screens for everyday tasks'],
  },
];

const faqs = [
  {
    q: 'Can one gym see another gym’s data?',
    a: `No. Each gym is a separate workspace, and the server checks every request against the gym the user belongs to, not just the screen they’re on. Only a Super Admin can move between gyms.`,
  },
  {
    q: 'Do you support more than one location?',
    a: 'Yes. Add as many branches as you need to a gym; they share the gym’s members, staff and records.',
  },
  {
    q: 'How do members pay?',
    a: 'Through Paystack. You create a payment for a member, share the checkout link, and verify it once they have paid.',
  },
  {
    q: 'Can I control what my front desk can do?',
    a: 'Yes. Access is based on roles. Give staff a role with only the permissions they need, and change it at any time.',
  },
  {
    q: 'Does it work on a phone or tablet?',
    a: 'Yes. The dashboard adapts to smaller screens, so you can check in on your gym from anywhere.',
  },
];

function Logo() {
  return (
    <a href="#top" className={styles.logo} aria-label={`${APP_NAME} home`}>
      <span className={styles.logoMark} aria-hidden>🏋️</span>
      <span className={styles.logoText}>{APP_NAME}</span>
    </a>
  );
}

/** A small, static drawing of the dashboard (not a screenshot). */
function DashboardPreview() {
  return (
    <div className={styles.preview} aria-hidden>
      <div className={styles.previewBar}>
        <span /><span /><span />
      </div>
      <div className={styles.previewBody}>
        <aside className={styles.previewSide}>
          <div className={styles.previewLabel}>Managing gym</div>
          <div className={styles.previewSelect}>Iron Paradise ▾</div>
          {['Analytics', 'All Gyms', 'Branches', 'Members', 'Staff', 'Classes', 'Payments', 'Sales'].map((item, i) => (
            <div key={item} className={i === 3 ? `${styles.previewNav} ${styles.previewNavActive}` : styles.previewNav}>{item}</div>
          ))}
        </aside>
        <div className={styles.previewMain}>
          <div className={styles.previewTitle}>Members</div>
          <div className={styles.previewStats}>
            <div><strong>248</strong><span>Members</span></div>
            <div><strong>3</strong><span>Plans</span></div>
            <div><strong>₦1.2m</strong><span>This month</span></div>
          </div>
          {[
            { name: 'Kemi Ojo', initials: 'KO', status: 'Active' },
            { name: 'Femi Lawal', initials: 'FL', status: 'Active' },
            { name: 'Ngozi Obi', initials: 'NO', status: 'Active' },
            { name: 'Segun Ade', initials: 'SA', status: 'Inactive' },
          ].map(({ name, initials, status }) => (
            <div key={name} className={styles.previewRow}>
              <span className={styles.previewAvatar}>{initials}</span>
              <span className={styles.previewName}>{name}</span>
              <span className={status === 'Active' ? styles.chipOk : styles.chipMuted}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div id="top">
      <header className={styles.header}>
        <div className={styles.container + ' ' + styles.headerInner}>
          <Logo />
          <nav className={styles.nav} aria-label="Main">
            <a href="#features">Features</a>
            <a href="#multi-gym">Multi-gym</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className={styles.headerActions}>
            <a href={`${APP_URL}/login`} className={styles.linkButton}>Sign in</a>
            <a href={`${APP_URL}/register`} className={styles.primaryButtonSmall}>Get started</a>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.container + ' ' + styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Gym management software</p>
              <h1 className={styles.heroTitle}>
                Run every gym location from <span className={styles.gradientText}>one dashboard</span>.
              </h1>
              <p className={styles.heroText}>
                {APP_NAME}{' '}keeps members, payments, staff, classes, equipment and shop sales in one place, for one gym or many,
                with each gym&apos;s data kept to itself.
              </p>
              <div className={styles.heroActions}>
                <a href={`${APP_URL}/register`} className={styles.primaryButton}>Get started</a>
                <a href="#features" className={styles.secondaryButton}>See what it does</a>
              </div>
              <ul className={styles.heroPoints}>
                <li>Paystack payments built in</li>
                <li>Unlimited branches</li>
                <li>Role-based access</li>
              </ul>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section id="features" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>Features</p>
              <h2 className={styles.sectionTitle}>Everything the front desk and the owner need</h2>
              <p className={styles.sectionText}>From the first member sign-up to the end-of-month numbers.</p>
            </div>
            <div className={styles.featureGrid}>
              {features.map((f) => (
                <article key={f.title} className={styles.featureCard}>
                  <span className={styles.featureIcon} aria-hidden>{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="multi-gym" className={`${styles.section} ${styles.sectionSoft}`}>
          <div className={styles.container + ' ' + styles.split}>
            <div>
              <p className={styles.eyebrow}>Built for more than one gym</p>
              <h2 className={styles.sectionTitle}>Each gym gets its own space</h2>
              <p className={styles.sectionText}>
                A Super Admin oversees every gym and switches between them from one menu. Everyone else works inside their own
                gym and only ever sees its members, staff and records.
              </p>
              <ul className={styles.checkList}>
                <li>Separation is enforced by the server on every request, not only hidden in the screens</li>
                <li>Gym admins add branches, staff and users for their own gym</li>
                <li>Switching gyms is a deliberate, confirmed step, so nothing is saved to the wrong place</li>
              </ul>
            </div>
            <div className={styles.tenantDiagram} aria-hidden>
              <div className={styles.tenantTop}>
                <span className={styles.tenantBadge}>Super Admin</span>
                <span className={styles.tenantSub}>sees all gyms</span>
              </div>
              <div className={styles.tenantLines} />
              <div className={styles.tenantGyms}>
                {[
                  { name: 'Iron Paradise', branches: '2 branches' },
                  { name: 'Lagos Fit Hub', branches: '1 branch' },
                  { name: 'Fit Titans', branches: '3 branches' },
                ].map(({ name, branches }) => (
                  <div key={name} className={styles.tenantGym}>
                    <strong>{name}</strong>
                    <span>{branches}</span>
                    <em>Admin · Staff</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>How it works</p>
              <h2 className={styles.sectionTitle}>Ready for day one in four steps</h2>
            </div>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionSoft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>For everyone on the team</p>
              <h2 className={styles.sectionTitle}>The right access for each person</h2>
            </div>
            <div className={styles.roleGrid}>
              {roles.map((r) => (
                <article key={r.name} className={styles.roleCard}>
                  <h3>{r.name}</h3>
                  <p className={styles.roleWho}>{r.who}</p>
                  <ul>
                    {r.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className={styles.section}>
          <div className={styles.container + ' ' + styles.faqWrap}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>FAQ</p>
              <h2 className={styles.sectionTitle}>Questions gym owners ask</h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((f) => (
                <details key={f.q} className={styles.faqItem}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container + ' ' + styles.ctaInner}>
            <h2>Bring all your gyms into one place</h2>
            <p>Set up your first gym in minutes.</p>
            <div className={styles.heroActions}>
              <a href={`${APP_URL}/register`} className={styles.ctaPrimary}>Get started</a>
              <a href={`${APP_URL}/login`} className={styles.ctaSecondary}>Sign in</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container + ' ' + styles.footerInner}>
          <Logo />
          <p>© {new Date().getFullYear()} {APP_NAME}. Gym management for every location.</p>
        </div>
      </footer>
    </div>
  );
}
