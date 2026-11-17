/*
 * Blog articles. Each one targets a specific question buyers search for
 * before they hire someone, and links to the matching service page.
 * Prices quoted here are EGO's own published prices (see packages.ts);
 * cloud-provider details are kept general so they don't go out of date.
 */
export interface BlogSection {
  h: string;
  paras?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  /** Text shown after the table/list. */
  note?: string;
}
export interface BlogPost {
  slug: string;
  title: string; // on-page H1
  metaTitle: string; // ≤ 41 chars; " | EGO Web Services" is appended
  description: string; // ≤ 155 chars
  excerpt: string;
  date: string; // ISO
  readMins: number;
  topic: "Cloud" | "Hosting";
  intro: string[];
  sections: BlogSection[];
  faq: { q: string; a: string }[];
  cta: { text: string; label: string; href: string };
  related: { label: string; href: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "google-cloud-migration-cost",
    title: "How much does a Google Cloud migration cost?",
    metaTitle: "Google Cloud Migration Cost (2026 Guide)",
    description:
      "What a Google Cloud migration really costs: the one-off project, monthly running costs, what drives the price, and how Google funding can lower it.",
    excerpt:
      "The one-off project, the monthly bill, what drives both, and how to keep them down, explained by a Google Cloud Partner.",
    date: "2026-11-17",
    readMins: 7,
    topic: "Cloud",
    intro: [
      "“How much will it cost to move to Google Cloud?” is the first question almost every client asks us, and the honest answer is: it depends on what you’re moving. But “it depends” isn’t useful when you’re planning a budget, so this guide breaks the cost into its real parts and gives you the numbers we actually charge.",
      "A cloud migration has two separate costs: the one-off project to move everything safely, and the monthly bill for running it on Google Cloud afterwards. Most budget surprises come from looking at only one of them.",
    ],
    sections: [
      {
        h: "1. The one-off migration project",
        paras: [
          "This is the work of planning the move, setting up a secure foundation (often called a landing zone), moving servers, applications and databases, testing, and handing over to your team. What drives the price is how much you have and how complicated it is, not which cloud you pick.",
        ],
        table: {
          head: ["Your situation", "Typical scope", "What it usually costs"],
          rows: [
            ["Not sure yet", "Fixed-price readiness assessment: inventory, cost estimate, recommended platform and a written roadmap", "$2,000 flat"],
            ["Small business: a few servers or one main app", "Landing zone, staged migration, backups, staff handover", "From $5,500"],
            ["Growing company: 10–50 servers, several databases", "Phased migration over weeks, with testing and rollback plans", "Quoted after the assessment"],
            ["Ongoing management after the move", "24/7 monitoring, security, cost optimisation, advice", "Managed plans from $9,000"],
          ],
        },
      },
      {
        h: "2. What makes a migration cost more (or less)",
        list: [
          "Number of servers, apps and databases. More systems means more planning, moving and testing.",
          "How much downtime you can accept. Moving over a weekend is cheaper than a live, zero-downtime cut-over.",
          "Old or custom software. Apps that can be moved as they are (“lift and shift”) cost less than apps that need changes to run well in the cloud.",
          "Data volume. Terabytes of data take longer to copy and verify.",
          "Compliance rules. Healthcare, finance or data-residency requirements add design and documentation work.",
          "Your team’s involvement. Clear access to systems and quick decisions shorten the project.",
        ],
      },
      {
        h: "3. The monthly Google Cloud bill",
        paras: [
          "After the move you pay Google for what you use: mainly computing power (virtual machines or containers), storage, databases, and network traffic leaving Google Cloud. Small businesses often pay less than they did for hardware, licences and data-centre space, but only if the setup is sized correctly.",
          "The most common mistake is copying old servers one-to-one. On-premises servers are usually bought far bigger than needed, and paying for that unused size every month in the cloud wipes out the savings. A good migration plan right-sizes every machine first.",
        ],
      },
      {
        h: "4. How to keep the cost down",
        list: [
          "Right-size before you move, based on real usage, not the old hardware specs.",
          "Use Google Cloud’s built-in discounts for steady workloads, such as sustained-use and committed-use discounts.",
          "Switch off non-production environments at night and on weekends.",
          "Use managed services (for example Cloud SQL instead of a self-managed database server) where they reduce work.",
          "Set budgets and alerts from day one so a mistake can’t run up a large bill.",
          "Ask about Google funding: as a Google Cloud Partner we can check whether your migration qualifies for programmes such as RaMP, which can include credits and partner funding, subject to Google’s approval.",
        ],
      },
      {
        h: "5. A realistic way to start",
        paras: [
          "If you’re not sure what you have or what it will cost to run, start with the readiness assessment. In about two weeks you get a full inventory, a monthly Google Cloud cost estimate, a recommended setup and a step-by-step migration plan with a fixed price. You can use it with us or with anyone else.",
        ],
      },
    ],
    faq: [
      { q: "How long does a Google Cloud migration take?", a: "A small business with a few servers usually takes two to six weeks after the assessment. Larger environments are moved in phases over several months so the business keeps running throughout." },
      { q: "Is Google Cloud cheaper than running our own servers?", a: "Often, once you include hardware replacement, licences, power, space and staff time, but only if the cloud setup is right-sized. The readiness assessment compares both with real numbers." },
      { q: "Can Google pay for part of our migration?", a: "Sometimes. Google runs migration programmes such as RaMP that can include credits and partner services funding. Eligibility depends on your workloads and Google’s approval; as a Google Cloud Partner we can check for you." },
    ],
    cta: { text: "Get a fixed price for your migration, plus a monthly cost estimate, in about two weeks.", label: "Start the $2,000 readiness assessment", href: "/checkout?service=consulting&package=Cloud%20Readiness%20Assessment" },
    related: [
      { label: "Google Cloud consulting & migration", href: "/google-cloud" },
      { label: "Cloud migration services", href: "/cloud-migration" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    slug: "aws-vs-google-cloud-vs-azure",
    title: "AWS vs Google Cloud vs Azure: which is best for a small business?",
    metaTitle: "AWS vs Google Cloud vs Azure for SMBs",
    description:
      "AWS, Google Cloud or Microsoft Azure? A plain-English comparison for small and mid-sized businesses: strengths, pricing, support, and how to choose.",
    excerpt:
      "All three are excellent. The right choice depends on the software you already use, your team’s skills and where your data needs to live.",
    date: "2026-11-17",
    readMins: 8,
    topic: "Cloud",
    intro: [
      "Amazon Web Services (AWS), Google Cloud and Microsoft Azure are the three largest cloud providers, and all three can run almost anything a small or mid-sized business needs. So the useful question isn’t “which is best?” but “which is best for us?”.",
      "We work on all three every week. Here’s how we help clients decide, without the marketing.",
    ],
    sections: [
      {
        h: "The short version",
        table: {
          head: ["If this sounds like you", "Usually the best fit"],
          rows: [
            ["You run Microsoft 365, Windows Server, SQL Server or Active Directory", "Microsoft Azure"],
            ["You want strong data analytics, AI or Kubernetes, or already use Google Workspace", "Google Cloud"],
            ["You need the widest choice of services and third-party tools, or your developers already know AWS", "AWS"],
            ["You have no strong preference", "Decide on cost, support and team skills (see below)"],
          ],
        },
      },
      {
        h: "Microsoft Azure: best when you already live in Microsoft",
        paras: [
          "If your business runs on Windows servers, SQL Server, Active Directory and Microsoft 365, Azure is usually the smoothest move. Identity and security connect directly to the Microsoft accounts your staff already use, and the Azure Hybrid Benefit lets you reuse eligible Windows Server and SQL Server licences, which can cut running costs significantly.",
        ],
      },
      {
        h: "Google Cloud: best for data, AI and modern apps",
        paras: [
          "Google Cloud is especially strong in data analytics (BigQuery), AI and machine learning, and containers: Kubernetes was created at Google, and Google Kubernetes Engine (GKE) is one of the most mature ways to run it. Pricing is straightforward, with automatic discounts for steady workloads, and businesses on Google Workspace get a natural fit.",
          "Google also funds some migrations through partner programmes, which can make the first year cheaper. (We’re a Google Cloud Partner, so we’re upfront about that.)",
        ],
      },
      {
        h: "AWS: the biggest catalogue",
        paras: [
          "AWS was first to market and has the largest range of services and the biggest marketplace of third-party software. If your developers already know AWS, or you depend on a tool that only runs well there, it’s often the practical choice. The flip side is complexity: with so many options, costs and security settings need careful management.",
        ],
      },
      {
        h: "What actually decides it",
        list: [
          "The software you already pay for. Licences you can reuse (especially Microsoft) can outweigh small price differences.",
          "Your team’s skills. The cloud your team, or your partner, knows well will be cheaper and safer to run.",
          "Where your data must live. All three have regions worldwide, but check the exact countries your customers or regulators require.",
          "Support. Compare the support plans and whether a partner will manage the platform for you.",
          "Total monthly cost for your setup, not list prices. The same workload can cost noticeably different amounts depending on sizing and discounts.",
        ],
      },
      {
        h: "Can you use more than one?",
        paras: [
          "Yes, and many businesses do: for example Microsoft 365 with Azure for identity, plus Google Cloud for analytics. For a small business, though, we usually recommend one main cloud to keep costs, skills and security simple, and adding a second only when there’s a clear reason.",
        ],
      },
    ],
    faq: [
      { q: "Which cloud is cheapest?", a: "None is always cheapest. For the same workload, prices are often close; reused licences, discounts for steady usage and right-sizing make a bigger difference than the provider’s list price." },
      { q: "Which cloud is most secure?", a: "All three meet the highest industry standards. Most real-world security problems come from misconfiguration, so how the account is set up and managed matters more than the provider." },
      { q: "Can we switch clouds later?", a: "Yes. Using containers, standard databases and infrastructure-as-code (such as Terraform) makes a later move much easier." },
    ],
    cta: { text: "Not sure which cloud fits? The readiness assessment compares the options for your actual systems and costs.", label: "Book a free consultation", href: "/contact" },
    related: [
      { label: "Google Cloud", href: "/google-cloud" },
      { label: "AWS consulting", href: "/aws" },
      { label: "Microsoft Azure", href: "/azure" },
    ],
  },
  {
    slug: "shared-vs-vps-vs-dedicated-hosting",
    title: "Shared vs VPS vs dedicated hosting: which do you need?",
    metaTitle: "Shared vs VPS vs Dedicated Hosting",
    description:
      "Shared, VPS or dedicated server? What each type of web hosting is, who it suits, how much it costs and when to upgrade, explained in plain English.",
    excerpt:
      "What each type of hosting is, who it suits, what it costs, and the signs it’s time to upgrade.",
    date: "2026-11-17",
    readMins: 6,
    topic: "Hosting",
    intro: [
      "Choosing hosting is confusing because every company uses different names for the same things. In practice there are three main types: shared hosting, a virtual private server (VPS) and a dedicated server. The difference is how much of a physical server is yours.",
    ],
    sections: [
      {
        h: "At a glance",
        table: {
          head: ["", "Shared", "VPS", "Dedicated"],
          rows: [
            ["What you get", "Space on a server shared with other sites", "Your own virtual server with guaranteed resources", "A whole physical server for you"],
            ["Best for", "Brochure sites, blogs, small business sites", "Busy sites, online shops, web apps", "High traffic, heavy databases, strict compliance"],
            ["Control", "Control panel (cPanel or Plesk)", "Control panel or full root access", "Full root access"],
            ["EGO price", "From $9/month", "From $45/month", "From $150/month"],
          ],
        },
      },
      {
        h: "Shared hosting",
        paras: [
          "Your website lives on a server alongside other customers’ sites, which keeps the price low. It’s ideal for a company website, a portfolio or a small WordPress site. The trade-off is that resources are shared, so it’s not the right choice for sites with heavy traffic or demanding applications.",
        ],
      },
      {
        h: "VPS hosting",
        paras: [
          "A VPS splits a powerful server into separate virtual machines, each with its own guaranteed CPU, memory and storage. Other customers can’t slow you down, and you can choose a control panel (cPanel/WHM or Plesk) or full root/SSH access to install what you need. It’s the sweet spot for online shops, membership sites and business applications.",
        ],
      },
      {
        h: "Dedicated servers",
        paras: [
          "With a dedicated server, the whole machine is yours. You get maximum performance and isolation, which matters for high-traffic sites, large databases, or businesses with strict security and compliance rules.",
        ],
      },
      {
        h: "Signs it’s time to upgrade",
        list: [
          "Your site slows down at busy times or shows errors when traffic spikes.",
          "You’re launching an online shop or a web app with logins and payments.",
          "You need software or settings your current plan doesn’t allow.",
          "You’ve been warned about using too many resources.",
          "Downtime is now costing you real money or customers.",
        ],
      },
      {
        h: "What to look for in any plan",
        list: [
          "Daily backups you can restore from.",
          "Free SSL certificates (the padlock in the browser).",
          "Monitoring and DDoS protection.",
          "Help moving your existing site, so the switch causes no downtime.",
          "An easy upgrade path, so you can move up a plan without rebuilding.",
        ],
        note: "Every EGO hosting plan includes daily backups, free SSL, DDoS protection and 24/7 monitoring, with your choice of cPanel/WHM, Plesk or a VM with full root access.",
      },
    ],
    faq: [
      { q: "Is shared hosting safe?", a: "Yes, on a well-run server. Accounts are isolated from each other, and backups, SSL and monitoring protect your site. Choose a VPS if you need guaranteed resources or custom software." },
      { q: "Can I move from shared to VPS later?", a: "Yes. We move your site to the bigger plan for you, usually with no downtime." },
      { q: "Do I need cPanel or Plesk?", a: "Both are easy control panels for managing websites, email and databases. cPanel is the most common for Linux hosting; Plesk is popular for Windows and multi-site management. Developers who prefer full control can choose a VM with root access instead." },
    ],
    cta: { text: "Pick a plan and order online in two minutes, or ask us which one fits your site.", label: "See hosting plans", href: "/pricing" },
    related: [
      { label: "Hosting plans and pricing", href: "/pricing" },
      { label: "Services: hosting", href: "/services#shared-hosting" },
      { label: "Managed cloud", href: "/managed-cloud" },
    ],
  },
];

export const findPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
