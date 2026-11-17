/*
 * Cloud solution blueprints: reference architectures EGO designs and builds,
 * shown at /solutions and /solutions/<slug>.
 *
 * These are blueprints (how we would build it), NOT client case studies.
 * Keep them that way: no client names, no claimed results. When you have a
 * real project you may publish, add it to portfolio.ts instead.
 * Prices quoted here are EGO's published package prices (see packages.ts).
 */
export type SolutionCloud = "Google Cloud" | "AWS" | "Microsoft Azure";

export interface SolutionTier {
  /** Row label in the diagram, e.g. "Edge & security". */
  name: string;
  items: string[];
}

export interface Solution {
  slug: string;
  title: string; // H1
  short: string; // card title
  metaTitle: string; // ≤ 41 chars; " | EGO Web Services" is appended
  description: string; // ≤ 155 chars
  industry: string;
  region: string;
  regionNote: string;
  cloud: SolutionCloud;
  /** Path of the matching cloud page. */
  cloudPath: string;
  accent: string;
  summary: string;
  /** What businesses in this industry need from the platform. */
  needs: string[];
  /** Diagram: rows from the user down to operations. */
  tiers: SolutionTier[];
  /** Key services and why each one is there. */
  stack: { name: string; why: string }[];
  security: string[];
  rollout: { phase: string; weeks: string; detail: string }[];
  timeline: string;
  outcomes: string[];
  faq: { q: string; a: string }[];
  blog?: { label: string; href: string };
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "ecommerce-kubernetes-google-cloud",
    title: "E-commerce platform on Google Kubernetes Engine",
    short: "E-commerce on GKE",
    metaTitle: "E-commerce on Kubernetes (GKE) Blueprint",
    description:
      "How we build an online store on Google Kubernetes Engine that scales for peak sales, keeps EU customer data in Europe and stays fast worldwide.",
    industry: "Retail & e-commerce",
    region: "Europe",
    regionNote: "Runs in a Google Cloud region in the EU (for example Frankfurt or Belgium) so customer data stays in Europe for GDPR.",
    cloud: "Google Cloud",
    cloudPath: "/google-cloud",
    accent: "#0f9d58",
    summary:
      "An online store that copes with Black Friday-level traffic without paying for peak capacity all year: containers on GKE scale up for the rush and back down overnight, while a CDN keeps product pages fast for shoppers everywhere.",
    needs: [
      "Handle traffic spikes from sales and campaigns without the site slowing down or going offline",
      "Keep checkout and payments reliable and secure",
      "Keep EU customers' personal data inside the EU",
      "Release new features often without downtime",
      "See sales and stock data in one place",
    ],
    tiers: [
      { name: "Shoppers", items: ["Web store", "Mobile app", "Admin team"] },
      { name: "Edge & security", items: ["Cloud CDN", "Cloud Armor (WAF & DDoS)", "Global load balancer"] },
      { name: "Application", items: ["GKE Autopilot", "Storefront & checkout services", "Pub/Sub order events"] },
      { name: "Data", items: ["Cloud SQL for PostgreSQL (high availability)", "Memorystore (Redis cache)", "Cloud Storage (product images)", "BigQuery (sales analytics)"] },
      { name: "Operations", items: ["Cloud Build & Artifact Registry", "Terraform", "Cloud Monitoring & Logging"] },
    ],
    stack: [
      { name: "GKE Autopilot", why: "Runs the storefront, cart and checkout as containers that add capacity automatically when traffic climbs; you pay for what the containers use." },
      { name: "Cloud SQL for PostgreSQL", why: "Managed database with a standby copy in a second zone, automatic backups and point-in-time recovery for orders and customers." },
      { name: "Memorystore for Redis", why: "Caches sessions, carts and product data so pages stay fast under load and the database isn't overwhelmed." },
      { name: "Cloud CDN + Cloud Armor", why: "Serves images and pages from locations near each shopper and blocks bots, scraping and common web attacks." },
      { name: "Pub/Sub", why: "Passes order events to email, stock and fulfilment systems, so a slow supplier API never holds up checkout." },
      { name: "BigQuery", why: "Brings orders, traffic and stock into one place for reporting and forecasting." },
    ],
    security: [
      "Card payments handled by a PCI-compliant provider (such as Stripe), so card numbers never touch your servers",
      "Customer data stored in an EU region; access limited with IAM roles and audit logs",
      "Web application firewall and DDoS protection in front of the store",
      "Secrets in Secret Manager, never in code",
      "Daily backups with tested restores",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–2", detail: "Review the current store, traffic patterns and integrations; agree the architecture and monthly cost estimate." },
      { phase: "Foundation", weeks: "Weeks 2–3", detail: "Secure Google Cloud landing zone with Terraform: networking, IAM, logging, CI/CD pipeline." },
      { phase: "Build & migrate", weeks: "Weeks 3–7", detail: "Containerise the store, move the database and images, connect payments, stock and email." },
      { phase: "Load test & launch", weeks: "Weeks 7–8", detail: "Simulate peak-sale traffic, tune autoscaling, then switch over with a rollback plan." },
      { phase: "Run & optimise", weeks: "Ongoing", detail: "24/7 monitoring, monthly cost review and scaling ahead of big campaigns." },
    ],
    timeline: "Typically 6–10 weeks for a store moving from a single server or traditional hosting.",
    outcomes: [
      "Capacity that scales up for sales and down when quiet",
      "Zero-downtime releases with a deployment pipeline",
      "A clear monthly cost estimate before you commit",
      "EU data residency documented for your GDPR records",
    ],
    faq: [
      { q: "Do we need Kubernetes for a small store?", a: "Not always. For smaller stores we often recommend Cloud Run, which is simpler and cheaper. Kubernetes pays off when you have several services, steady traffic or big peaks. The assessment tells you which fits." },
      { q: "Can you move our existing store without downtime?", a: "Yes. We copy data in the background, test everything on the new platform, then switch traffic over in a short, planned window with a rollback plan." },
      { q: "Will this work with Shopify or WooCommerce?", a: "Fully hosted Shopify doesn't need this. WooCommerce, Magento and custom stores can all run on this design." },
    ],
    blog: { label: "How much does a Google Cloud migration cost?", href: "/blog/google-cloud-migration-cost" },
  },
  {
    slug: "fintech-payments-aws-middle-east",
    title: "Fintech payments platform on AWS with in-country data",
    short: "Fintech on AWS (UAE)",
    metaTitle: "Fintech Platform on AWS (UAE) Blueprint",
    description:
      "How we build a secure fintech platform on AWS in the UAE region: data residency, PCI DSS-ready design, encryption and full audit trails.",
    industry: "Financial services & fintech",
    region: "Middle East",
    regionNote: "Runs in the AWS Middle East (UAE) region so financial data can stay in-country where regulators require it.",
    cloud: "AWS",
    cloudPath: "/aws",
    accent: "#ff9900",
    summary:
      "A wallet, lending or payments platform needs bank-grade security, a full audit trail and data kept in the right country. This design isolates every layer, encrypts everything and logs every action, without slowing your developers down.",
    needs: [
      "Keep customer and transaction data in-country to meet local regulations",
      "Pass security reviews from banks, partners and regulators",
      "Encrypt data everywhere and control who can see what",
      "Stay online through failures with no lost transactions",
      "Ship features quickly with controls built in",
    ],
    tiers: [
      { name: "Customers & partners", items: ["Mobile app", "Web dashboard", "Partner & bank APIs"] },
      { name: "Edge & security", items: ["AWS WAF & Shield", "API Gateway", "Amazon Cognito"] },
      { name: "Application", items: ["Amazon EKS (private subnets)", "Payments & ledger services", "Amazon SQS queues"] },
      { name: "Data", items: ["Aurora PostgreSQL (Multi-AZ)", "AWS KMS encryption keys", "S3 with Object Lock (records)"] },
      { name: "Security & operations", items: ["CloudTrail & Security Hub", "GuardDuty", "Terraform & CI/CD"] },
    ],
    stack: [
      { name: "Amazon EKS", why: "Runs the payments, ledger and onboarding services in private subnets with no direct internet access." },
      { name: "Aurora PostgreSQL", why: "Transaction database replicated across availability zones, encrypted with your own KMS keys, with continuous backups." },
      { name: "AWS KMS & Secrets Manager", why: "Central control of encryption keys and credentials, with every use logged." },
      { name: "API Gateway + WAF + Shield", why: "One secured, rate-limited entry point for apps and partners, protected against attacks." },
      { name: "Amazon SQS", why: "Queues payment steps so nothing is lost if a bank or card network is slow or down." },
      { name: "CloudTrail, GuardDuty, Security Hub", why: "Tamper-evident audit trail, threat detection and a single view of compliance checks." },
    ],
    security: [
      "Separate AWS accounts for production, staging and security logging",
      "Encryption at rest and in transit, with customer-managed keys",
      "Least-privilege access, multi-factor authentication and approval for production changes",
      "Network design and controls aligned with PCI DSS requirements",
      "Write-once storage for records that must be kept for audit",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–3", detail: "Map regulatory and partner requirements, data flows and risks; agree architecture and controls." },
      { phase: "Secure foundation", weeks: "Weeks 3–5", detail: "Multi-account AWS setup with guardrails, networking, logging and key management, all in Terraform." },
      { phase: "Build & integrate", weeks: "Weeks 5–10", detail: "Deploy services on EKS, set up the database and queues, connect bank and card partners." },
      { phase: "Test & review", weeks: "Weeks 10–12", detail: "Failure testing, penetration test support and evidence pack for auditors." },
      { phase: "Run & monitor", weeks: "Ongoing", detail: "24/7 monitoring, security alerts, patching and quarterly access reviews." },
    ],
    timeline: "Typically 10–14 weeks, depending on partner integrations and audit requirements.",
    outcomes: [
      "Data residency in the UAE region, documented for regulators",
      "An audit-ready evidence pack for security reviews",
      "No single point of failure in the transaction path",
      "Guardrails that stop risky changes before they reach production",
    ],
    faq: [
      { q: "Does this make us PCI DSS compliant?", a: "Compliance is assessed for your whole business, not just the cloud. This design gives you infrastructure built to PCI DSS requirements and the evidence an assessor will ask for, which makes certification much easier." },
      { q: "Can we use a different country or region?", a: "Yes. The same design works in any AWS region; we pick the one that matches where your customers and regulators are." },
      { q: "We already run on AWS. Can you review what we have?", a: "Yes. A security and cost review of an existing AWS setup is often the best first step." },
    ],
    blog: { label: "AWS vs Google Cloud vs Azure for small businesses", href: "/blog/aws-vs-google-cloud-vs-azure" },
  },
  {
    slug: "healthcare-patient-portal-azure",
    title: "HIPAA-ready patient portal on Microsoft Azure",
    short: "Healthcare portal on Azure",
    metaTitle: "HIPAA-Ready Patient Portal on Azure",
    description:
      "How we build a secure patient portal on Microsoft Azure: HIPAA-ready design, private networking, Microsoft sign-in and full audit logging.",
    industry: "Healthcare & clinics",
    region: "United States",
    regionNote: "Runs in US Azure regions, covered by Microsoft's HIPAA Business Associate Agreement.",
    cloud: "Microsoft Azure",
    cloudPath: "/azure",
    accent: "#0078d4",
    summary:
      "Clinics and health-tech companies need patients to book, message and see records online, while protecting health information. This design keeps patient data on private networks, encrypts it and records every access.",
    needs: [
      "Protect patient health information (PHI) under HIPAA",
      "Let patients book appointments, message staff and see documents securely",
      "Use staff's existing Microsoft 365 accounts for sign-in",
      "Prove who accessed which record and when",
      "Stay available during clinic hours with tested backups",
    ],
    tiers: [
      { name: "Patients & staff", items: ["Patient web portal", "Mobile app", "Staff (Microsoft 365)"] },
      { name: "Edge & identity", items: ["Azure Front Door + WAF", "Microsoft Entra ID", "Entra External ID (patients)"] },
      { name: "Application", items: ["Azure App Service (private)", "Azure Functions", "Service Bus"] },
      { name: "Data", items: ["Azure SQL Database", "Blob Storage (documents)", "Azure Key Vault"] },
      { name: "Security & operations", items: ["Microsoft Defender for Cloud", "Azure Monitor & Sentinel", "Bicep / Terraform"] },
    ],
    stack: [
      { name: "Azure App Service + Private Endpoints", why: "Runs the portal with databases and storage reachable only over private network links." },
      { name: "Microsoft Entra ID & External ID", why: "Staff sign in with Microsoft 365; patients get secure sign-up with multi-factor authentication." },
      { name: "Azure SQL Database", why: "Encrypted, highly available database with automatic backups and auditing of every query on sensitive tables." },
      { name: "Blob Storage + Key Vault", why: "Stores scans and documents encrypted, with keys and secrets managed centrally." },
      { name: "Front Door + WAF", why: "Fast, protected entry point that blocks common web attacks." },
      { name: "Defender for Cloud & Sentinel", why: "Continuous security checks against healthcare benchmarks and alerting on suspicious activity." },
    ],
    security: [
      "HIPAA Business Associate Agreement with Microsoft covers the Azure services used",
      "Patient data on private endpoints only; no public database access",
      "Encryption at rest and in transit; keys in Key Vault",
      "Access logs and audit trails retained for compliance",
      "Role-based access so staff only see what their role needs",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–2", detail: "Map PHI data flows, user roles and existing systems (EHR, scheduling, Microsoft 365)." },
      { phase: "Foundation", weeks: "Weeks 2–4", detail: "Azure landing zone with policies, private networking, identity and logging." },
      { phase: "Build & integrate", weeks: "Weeks 4–9", detail: "Portal, booking and messaging; connect EHR and scheduling systems through secure APIs." },
      { phase: "Security testing", weeks: "Weeks 9–10", detail: "Penetration test support, access reviews and backup restore test." },
      { phase: "Run & support", weeks: "Ongoing", detail: "24/7 monitoring, patching, and compliance reports on request." },
    ],
    timeline: "Typically 8–12 weeks, depending on the systems the portal connects to.",
    outcomes: [
      "A portal patients can use from any device",
      "Single sign-on for staff with their Microsoft accounts",
      "Audit logs ready for HIPAA reviews",
      "Licence savings where existing Microsoft licences can be reused",
    ],
    faq: [
      { q: "Is Azure HIPAA compliant?", a: "Microsoft signs a HIPAA Business Associate Agreement covering many Azure services. Compliance also depends on how the system is configured and run, which is what this design addresses." },
      { q: "Can it connect to our EHR?", a: "Usually, yes, through the EHR's API or standards such as HL7 FHIR. We confirm what your EHR supports during the assessment." },
      { q: "Can this run outside the US?", a: "Yes. The same design works in other Azure regions, adjusted for local health-data rules such as GDPR in Europe." },
    ],
  },
  {
    slug: "multi-tenant-saas-kubernetes",
    title: "Multi-tenant SaaS platform on Kubernetes",
    short: "SaaS on Kubernetes",
    metaTitle: "Multi-Tenant SaaS on Kubernetes Blueprint",
    description:
      "How we build a multi-tenant SaaS platform on Kubernetes: tenant isolation, GitOps releases, multi-region setup and per-customer cost tracking.",
    industry: "Software & SaaS",
    region: "North America & global",
    regionNote: "Starts in one North American region with the option to add regions in Europe or Asia for customers who need local data.",
    cloud: "Google Cloud",
    cloudPath: "/google-cloud",
    accent: "#4285f4",
    summary:
      "SaaS companies need to onboard new customers in minutes, keep each customer's data separate, and release several times a day without breaking anything. This platform makes all three routine, and grows region by region as you sign customers abroad.",
    needs: [
      "Onboard a new customer automatically, without manual setup",
      "Keep each customer's data isolated and secure",
      "Release often with no downtime and easy rollback",
      "Offer data residency to enterprise customers in other regions",
      "Know what each customer costs to serve",
    ],
    tiers: [
      { name: "Customers", items: ["Web app", "Public API", "Admin console"] },
      { name: "Edge", items: ["Global load balancer", "Cloud Armor", "Identity Platform (SSO)"] },
      { name: "Platform", items: ["GKE clusters per region", "Namespace per tenant tier", "Argo CD (GitOps)"] },
      { name: "Data", items: ["Cloud SQL / AlloyDB", "Memorystore", "Cloud Storage per tenant"] },
      { name: "Operations", items: ["Terraform modules", "Managed Prometheus & Grafana", "Billing export to BigQuery"] },
    ],
    stack: [
      { name: "GKE (Kubernetes)", why: "One platform for all services, with namespaces, network policies and resource quotas to isolate tenants." },
      { name: "Argo CD (GitOps)", why: "Every change goes through Git and is applied automatically, with one-click rollback." },
      { name: "Terraform modules", why: "A new region, environment or dedicated enterprise tenant is created from code in hours, not weeks." },
      { name: "Cloud SQL / AlloyDB", why: "Managed PostgreSQL with high availability; shared or dedicated databases depending on the customer's plan." },
      { name: "Identity Platform", why: "Customer sign-in with SSO (SAML/OIDC) for enterprise accounts." },
      { name: "Billing export + BigQuery", why: "Labels on every resource show what each tenant and feature costs." },
    ],
    security: [
      "Tenant isolation with namespaces, network policies and separate encryption keys for enterprise tenants",
      "SSO and multi-factor authentication for admin access",
      "Signed container images and vulnerability scanning in the pipeline",
      "Audit logs for every change, ready for SOC 2 evidence",
      "Regional data storage for customers who need it",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–2", detail: "Review the app, tenancy model, release process and growth plans." },
      { phase: "Platform foundation", weeks: "Weeks 2–5", detail: "Clusters, networking, GitOps and observability, all as reusable Terraform modules." },
      { phase: "Migrate services", weeks: "Weeks 5–9", detail: "Containerise and move services, automate tenant onboarding." },
      { phase: "Launch & hand over", weeks: "Weeks 9–10", detail: "Cut over, document runbooks and train your developers." },
      { phase: "Expand", weeks: "When needed", detail: "Add regions or dedicated enterprise tenants from the same modules." },
    ],
    timeline: "Typically 8–12 weeks for an existing product; new regions afterwards in days.",
    outcomes: [
      "New customers onboarded automatically",
      "Several safe releases a day with instant rollback",
      "Cost per customer visible in a dashboard",
      "A ready path to enterprise deals that require local data",
    ],
    faq: [
      { q: "Can this run on AWS (EKS) or Azure (AKS) instead?", a: "Yes. The design is Kubernetes-based and works on EKS and AKS too; we use the matching managed services on each cloud." },
      { q: "Shared or separate databases per customer?", a: "Most SaaS products use shared databases with strict separation for smaller customers and dedicated databases for enterprise plans. We help you choose." },
      { q: "Do we need a platform team to run it?", a: "No. We can run the platform for you as managed cloud, or train your developers to run it themselves." },
    ],
  },
  {
    slug: "logistics-data-platform-bigquery",
    title: "Logistics & fleet data platform on Google Cloud",
    short: "Logistics data on BigQuery",
    metaTitle: "Logistics Data Platform on BigQuery",
    description:
      "How we build a real-time logistics and fleet data platform on Google Cloud: live tracking, BigQuery analytics, dashboards and demand forecasting.",
    industry: "Logistics & transport",
    region: "Middle East & Africa",
    regionNote: "Runs in a nearby Google Cloud region (for example Doha, Dammam or Johannesburg) to keep data local and dashboards fast.",
    cloud: "Google Cloud",
    cloudPath: "/google-cloud",
    accent: "#ea4335",
    summary:
      "Delivery and fleet companies have data scattered across GPS trackers, warehouse systems and spreadsheets. This platform streams it into one place, shows live operations on a dashboard and forecasts demand so you can plan drivers and stock.",
    needs: [
      "See every vehicle and delivery live on one dashboard",
      "Combine GPS, warehouse, order and fuel data that live in different systems",
      "Spot late deliveries and idle vehicles before customers complain",
      "Forecast demand to plan drivers, routes and stock",
      "Keep data in the region",
    ],
    tiers: [
      { name: "Sources", items: ["GPS / IoT trackers", "Warehouse & order systems", "Driver app"] },
      { name: "Ingestion", items: ["Pub/Sub (live events)", "Dataflow (streaming)", "Scheduled imports"] },
      { name: "Warehouse", items: ["BigQuery", "Cloud Storage (raw data)", "Dataform (data models)"] },
      { name: "Insight", items: ["Looker Studio dashboards", "Vertex AI forecasting", "Alerts to email & Slack"] },
      { name: "Operations", items: ["Terraform", "Cloud Monitoring", "IAM & data access controls"] },
    ],
    stack: [
      { name: "Pub/Sub + Dataflow", why: "Takes in live location and status events from thousands of devices and cleans them as they arrive." },
      { name: "BigQuery", why: "One warehouse for all operational data, fast enough for live dashboards and years of history." },
      { name: "Dataform", why: "Turns raw data into tested, documented tables (deliveries, routes, costs) your team can trust." },
      { name: "Looker Studio", why: "Dashboards for operations, management and customers, no extra licences needed to start." },
      { name: "Vertex AI", why: "Demand and delivery-time forecasts trained on your own history." },
      { name: "Cloud Storage", why: "Low-cost archive of raw data for audits and re-processing." },
    ],
    security: [
      "Data stored in a regional Google Cloud location",
      "Row- and column-level access so each team or customer sees only its data",
      "Encryption at rest and in transit",
      "Audit logs of every query on sensitive data",
      "Budget alerts to keep analytics costs predictable",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–2", detail: "List data sources, key questions and dashboards; agree the data model." },
      { phase: "Foundation & ingestion", weeks: "Weeks 2–5", detail: "Set up the project, streaming pipeline and imports from existing systems." },
      { phase: "Models & dashboards", weeks: "Weeks 5–8", detail: "Build trusted tables and the first operations and management dashboards." },
      { phase: "Forecasting", weeks: "Weeks 8–10", detail: "Train and validate demand forecasts; add alerts for late or at-risk deliveries." },
      { phase: "Run & improve", weeks: "Ongoing", detail: "New dashboards and data sources as the business asks new questions." },
    ],
    timeline: "Typically 6–10 weeks to the first live dashboards, with forecasting added after.",
    outcomes: [
      "One live view of the fleet and deliveries",
      "Reports that used to take days produced automatically",
      "Forecasts to plan drivers and stock ahead",
      "A data platform that grows with new sources",
    ],
    faq: [
      { q: "Our data is in spreadsheets and an old system. Is that OK?", a: "Yes. Most projects start that way. We import what you have and improve data quality step by step." },
      { q: "How much does BigQuery cost to run?", a: "For most mid-sized fleets, running costs are modest because you pay for storage and the queries you run. We give you a monthly estimate during the assessment and set budget alerts." },
      { q: "Can customers see their own deliveries?", a: "Yes. We can publish secure dashboards or an API so each customer sees only their shipments." },
    ],
    blog: { label: "How much does a Google Cloud migration cost?", href: "/blog/google-cloud-migration-cost" },
  },
  {
    slug: "video-streaming-aws-asia-pacific",
    title: "Video streaming & e-learning platform on AWS",
    short: "Streaming on AWS (APAC)",
    metaTitle: "Video Streaming Platform on AWS Blueprint",
    description:
      "How we build a video streaming or e-learning platform on AWS in Asia-Pacific: adaptive streaming, global CDN, secure playback and serverless backend.",
    industry: "Media & e-learning",
    region: "Asia-Pacific",
    regionNote: "Runs in the AWS Singapore region with CloudFront delivering video from edge locations across Asia and worldwide.",
    cloud: "AWS",
    cloudPath: "/aws",
    accent: "#8c4fff",
    summary:
      "Course creators, media brands and training companies need video that starts instantly on any connection, is protected from piracy, and doesn't bankrupt them as viewers grow. This serverless design costs little when quiet and scales to large audiences.",
    needs: [
      "Smooth playback on mobile networks and slow connections",
      "Protect paid content from downloading and sharing",
      "Handle launches and live events with sudden audiences",
      "Low running costs when traffic is quiet",
      "Track who watched what for courses and reporting",
    ],
    tiers: [
      { name: "Viewers", items: ["Web player", "Mobile apps", "Smart TV"] },
      { name: "Delivery", items: ["Amazon CloudFront", "Signed URLs & cookies", "AWS WAF"] },
      { name: "Media processing", items: ["S3 uploads", "AWS Elemental MediaConvert", "Step Functions workflow"] },
      { name: "Backend", items: ["API Gateway + Lambda", "DynamoDB", "Amazon Cognito"] },
      { name: "Operations", items: ["CloudWatch dashboards", "AWS CDK / Terraform", "Cost & usage alerts"] },
    ],
    stack: [
      { name: "AWS Elemental MediaConvert", why: "Converts each upload into adaptive streams (HLS) so the player switches quality to match the viewer's connection." },
      { name: "Amazon CloudFront", why: "Delivers video from edge locations near viewers for fast starts and fewer buffering pauses." },
      { name: "Signed URLs + DRM option", why: "Only paying, signed-in viewers can play videos; DRM can be added for premium content." },
      { name: "Lambda + API Gateway", why: "Serverless backend for courses, users and progress: no servers to manage, near-zero cost when idle." },
      { name: "DynamoDB", why: "Fast database for viewing progress, entitlements and playback events at any scale." },
      { name: "Step Functions", why: "Automates the upload, encode, thumbnail and publish workflow with retries." },
    ],
    security: [
      "Private storage buckets; video served only through the CDN with signed links",
      "Viewer sign-in with Cognito, including social and SSO login",
      "WAF rules against scraping and credential stuffing",
      "Encryption at rest and in transit",
      "Cost alerts so viral traffic never becomes a surprise bill",
    ],
    rollout: [
      { phase: "Assess & design", weeks: "Weeks 1–2", detail: "Content library size, audience locations, devices and monetisation model." },
      { phase: "Media pipeline", weeks: "Weeks 2–4", detail: "Upload, encoding and publishing workflow; migrate the existing library." },
      { phase: "Backend & player", weeks: "Weeks 4–8", detail: "Accounts, payments, course progress and the web and mobile player." },
      { phase: "Load test & launch", weeks: "Weeks 8–9", detail: "Simulate launch-day audiences, tune caching and go live." },
      { phase: "Run & optimise", weeks: "Ongoing", detail: "Monitoring, CDN cost tuning and new features." },
    ],
    timeline: "Typically 6–9 weeks, depending on the size of the existing video library.",
    outcomes: [
      "Fast, adaptive playback across Asia-Pacific and beyond",
      "Paid content protected from casual sharing",
      "Low running costs that grow with your audience",
      "Viewing data for course completion and reporting",
    ],
    faq: [
      { q: "Can we stream live events too?", a: "Yes. AWS Elemental MediaLive or Amazon IVS can be added for live streaming alongside on-demand video." },
      { q: "What about viewers in China?", a: "Serving mainland China has extra licensing and network requirements. We can advise on options if it matters for your audience." },
      { q: "We have thousands of existing videos. Can you move them?", a: "Yes. The pipeline processes your existing library in bulk and keeps links and course structure intact." },
    ],
  },
];

export const findSolution = (slug: string) => SOLUTIONS.find((s) => s.slug === slug);
