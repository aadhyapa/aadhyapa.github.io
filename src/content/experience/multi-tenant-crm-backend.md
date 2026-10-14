---
kind: project
title: 'Multi-Tenant CRM Backend'
client: 'Waggoner Financials, via Imagine Software Club'
start: 2026-02-01
end: 2026-05-01
summary: 'A fault-tolerant microservice backend for a multi-tenant mobile CRM, led as team lead.'
did:
  - 'Architected a scalable Go microservice backend deployed on EC2.'
  - 'Built an asynchronous ingestion pipeline with a Redis job queue and configurable business rules per tenant.'
  - 'Designed a PostgreSQL schema for full contact lifecycle tracking across organizations, shipped through a GitHub Actions CI/CD pipeline.'
stack: ['Go', 'Redis', 'PostgreSQL', 'EC2', 'GitHub Actions']
problem: "A mobile CRM serving several organizations needed a backend that kept each tenant's data and business rules separate, tracked a contact through its full lifecycle, and kept working when parts of the system failed."
order: 6
---
