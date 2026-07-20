require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Blog = require('../modules/blogs/blog.model');

const jsonData = {
  "source": "https://www.ces-pl.com/",
  "note": "Topics selected to cover CES-Tech solutions/services NOT already covered by their existing 4 blog posts (wireless security, network infra threats, network monitoring, network segmentation).",
  "posts": [
    {
      "title": "SD-WAN vs Traditional WAN: Why Enterprises Are Making the Switch in 2026",
      "excerpt": "Traditional MPLS networks are giving way to software-defined WAN architectures. Here's what's driving the shift, and how to evaluate if SD-WAN is right for your enterprise network.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "SD-WAN vs Traditional WAN: 2026 Enterprise Guide | CES-Tech",
        "meta_description": "Compare SD-WAN and traditional WAN architectures. Learn cost, performance, and security differences to plan your enterprise network transformation."
      },
      "tags": ["SD-WAN", "Enterprise Networking", "WAN", "Network Transformation", "Cisco SD-WAN"],
      "categories": ["Solutions", "Network Consulting"],
      "content_outline": [
        "What SD-WAN is and how it differs from MPLS/traditional WAN",
        "Key drivers: cost reduction, cloud-first traffic, hybrid work",
        "Application-aware routing and performance benefits",
        "Security add-ons: SASE and zero-trust integration",
        "How to run an SD-WAN readiness assessment"
      ]
    },
    {
      "title": "Cisco ACI Explained: Simplifying Data Center Network Automation",
      "excerpt": "Application Centric Infrastructure turns manual, box-by-box network configuration into policy-driven automation. Here's how ACI works and where it delivers the most value.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Cisco ACI Explained: Data Center Automation Guide | CES-Tech",
        "meta_description": "Understand how Cisco ACI automates data center networking with policy-based management, improving agility, visibility, and security."
      },
      "tags": ["Cisco ACI", "Data Center", "Network Automation", "SDN"],
      "categories": ["Solutions", "Data Center"],
      "content_outline": [
        "The problem with manually-configured data center networks",
        "Core ACI concepts: APIC controller, spine-leaf fabric, application profiles",
        "Policy consistency across on-prem and multi-cloud",
        "Visibility and troubleshooting improvements",
        "Signs your data center is ready for ACI"
      ]
    },
    {
      "title": "Cloud Migration Roadmap: A Practical Guide for Mid-Size Enterprises",
      "excerpt": "Moving workloads to the cloud without a plan leads to cost overruns and downtime. This roadmap breaks migration into manageable phases any IT team can follow.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Cloud Migration Roadmap for Enterprises | CES-Tech",
        "meta_description": "A step-by-step cloud migration roadmap covering assessment, workload prioritization, execution, and post-migration optimization."
      },
      "tags": ["Cloud Migration", "Cloud Solution", "IT Infrastructure", "Hybrid Cloud"],
      "categories": ["Solutions", "Cloud"],
      "content_outline": [
        "Assessing current infrastructure and workload readiness",
        "Lift-and-shift vs re-platform vs re-architect",
        "Building a phased migration plan with minimal downtime",
        "Cost management and avoiding cloud sprawl",
        "Common migration pitfalls to avoid"
      ]
    },
    {
      "title": "VAPT 101: Why Every Business Needs Regular Penetration Testing",
      "excerpt": "Vulnerability Assessment and Penetration Testing isn't a one-time compliance checkbox. Here's what VAPT actually covers and how often you should run it.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "VAPT 101: Why Businesses Need Penetration Testing | CES-Tech",
        "meta_description": "Learn what Vulnerability Assessment and Penetration Testing (VAPT) covers, why it matters, and how often businesses should test their networks."
      },
      "tags": ["VAPT", "Cyber Security", "Penetration Testing", "Vulnerability Assessment", "Compliance"],
      "categories": ["Services", "Cyber Security"],
      "content_outline": [
        "VA vs PT: what each actually tests",
        "Common vulnerabilities VAPT uncovers in enterprise networks",
        "Compliance drivers: ISO 27001, PCI-DSS, and regulations",
        "How often to run VAPT and after which changes",
        "What a good VAPT report and remediation plan looks like"
      ]
    },
    {
      "title": "Managed IT Services vs In-House IT: Making the Right Choice for 2026",
      "excerpt": "Should you build an internal IT team or partner with a Managed Services Provider? A cost, coverage, and risk comparison to help you decide.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Managed IT Services vs In-House IT: 2026 Comparison | CES-Tech",
        "meta_description": "Compare managed IT services and in-house IT teams on cost, 24/7 coverage, expertise, and scalability to choose the right model."
      },
      "tags": ["Managed Services", "Managed IT", "IT Outsourcing", "IT Strategy"],
      "categories": ["Services", "Managed Services"],
      "content_outline": [
        "Cost comparison: fully-loaded in-house team vs MSP retainer",
        "Coverage gaps: nights, weekends, specialist skill sets",
        "Scalability as the business grows",
        "Risk and accountability: SLAs vs internal ownership",
        "When a hybrid model (in-house + MSP) works best"
      ]
    },
    {
      "title": "Annual Maintenance Contracts: What Should Actually Be in Your AMC SLA",
      "excerpt": "Not all AMCs are created equal. Here's what response times, coverage scope, and escalation clauses to look for before signing an IT maintenance contract.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "What to Include in an IT AMC SLA | CES-Tech",
        "meta_description": "A breakdown of what a strong Annual Maintenance Contract SLA should cover, from response times to spare parts and escalation matrices."
      },
      "tags": ["AMC", "SLA", "IT Maintenance", "IT Support"],
      "categories": ["Services", "IT Infrastructure"],
      "content_outline": [
        "Preventive vs reactive maintenance clauses",
        "Response time and resolution time benchmarks",
        "Spare parts, hardware replacement, and warranty overlap",
        "Escalation matrix and reporting cadence",
        "Red flags in vendor AMC proposals"
      ]
    },
    {
      "title": "Building a Resilient Data Center: Key Design Considerations for 2026",
      "excerpt": "From power redundancy to cooling and network fabric, a resilient data center is designed, not assembled. Here are the design pillars that matter most.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Resilient Data Center Design: Key Considerations | CES-Tech",
        "meta_description": "Explore the core design pillars of a resilient, high-availability data center: redundancy, cooling, network fabric, and security."
      },
      "tags": ["Data Center", "IT Infrastructure", "High Availability", "Disaster Recovery"],
      "categories": ["Solutions", "Data Center"],
      "content_outline": [
        "Tier standards and redundancy (N, N+1, 2N) explained",
        "Power and cooling design fundamentals",
        "Spine-leaf network fabric for scalability",
        "Disaster recovery and backup site strategy",
        "Physical and cyber security layers in the data center"
      ]
    },
    {
      "title": "Enterprise Voice & Video: Unifying Communication in the Hybrid Workplace",
      "excerpt": "Hybrid work has made fragmented communication tools a productivity drain. Here's how unified voice and video solutions bring calling, meetings, and collaboration together.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Unified Voice & Video Solutions for Hybrid Work | CES-Tech",
        "meta_description": "How enterprise voice and video solutions unify calling, meetings, and collaboration for distributed and hybrid teams."
      },
      "tags": ["Voice and Video", "Unified Communications", "Hybrid Work", "Collaboration"],
      "categories": ["Solutions", "Unified Communications"],
      "content_outline": [
        "The fragmented-tools problem in hybrid workplaces",
        "What unified communications (UC) actually integrates",
        "Network readiness: QoS and bandwidth for voice/video",
        "Security considerations for enterprise calling platforms",
        "Rollout tips for company-wide adoption"
      ]
    },
    {
      "title": "Network Audits That Actually Matter: A CIO's Checklist",
      "excerpt": "A network audit is only useful if it uncovers real risk. Here's the checklist CIOs should demand before signing off on their next network audit report.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "Network Audit Checklist for CIOs | CES-Tech",
        "meta_description": "A practical network audit checklist covering security, performance, documentation, and compliance gaps every CIO should ask about."
      },
      "tags": ["Network Audit", "IT Governance", "Network Security", "Compliance"],
      "categories": ["Services", "Network Consulting"],
      "content_outline": [
        "Why routine audits get treated as a checkbox exercise",
        "Security gaps: firewall rules, access control, patch status",
        "Performance and capacity bottlenecks to flag",
        "Documentation and configuration drift review",
        "Turning audit findings into a prioritized action plan"
      ]
    },
    {
      "title": "IT Infrastructure Rental: A Smart, Cost-Effective Alternative to CapEx",
      "excerpt": "Buying servers and networking gear ties up capital and depreciates fast. Here's when renting IT infrastructure makes better financial and operational sense.",
      "status": "Draft",
      "visibility": "Public",
      "seo": {
        "meta_title": "IT Infrastructure Rental vs Buying: CapEx Guide | CES-Tech",
        "meta_description": "Compare renting vs buying IT infrastructure. Learn when rental servers, storage, and networking gear make sense over capital purchases."
      },
      "tags": ["IT Rental", "IT Infrastructure", "CapEx vs OpEx", "IT Procurement"],
      "categories": ["Services", "IT Infrastructure"],
      "content_outline": [
        "CapEx vs OpEx: the financial case for renting IT hardware",
        "Use cases: short-term projects, events, DR, scaling",
        "What's typically available on rental",
        "Maintenance and support included with rental agreements",
        "How to decide: rental vs lease vs purchase"
      ]
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to DB');

    for (let post of jsonData.posts) {
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const content = `<ul>${post.content_outline.map(line => `<li>${line}</li>`).join('')}</ul>`;
      
      await Blog.findOneAndUpdate(
        { slug },
        {
          title: post.title,
          slug,
          excerpt: post.excerpt,
          content,
          metaTitle: post.seo.meta_title,
          metaDescription: post.seo.meta_description,
          tags: post.tags,
          categories: post.categories,
          status: 'published', // Publishing them so they show up
          author: { name: 'CES Team' },
          publishedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`Inserted/Updated: ${post.title}`);
    }

    console.log('Done seeding blogs!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
