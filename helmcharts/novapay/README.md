# NovaPay Helm Deployment (POC)

This Helm chart deploys the backend core of the NovaPay fintech platform inside Kubernetes.

Current deployment scope:

- PostgreSQL database
- Redis cache
- NovaPay API service

This is a Proof-of-Concept (POC) Helm deployment designed to validate Kubernetes orchestration before expanding to the full platform stack.

---

# Architecture

```
           ┌───────────────┐
           │   NovaPay API │
           │     :3001     │
           └───────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌────▼────┐
    │ Postgres │         │  Redis  │
    │  :5432   │         │  :6379  │
    └──────────┘         └─────────┘
```

---

# Chart Structure

```
helmcharts/novapay
├── Chart.yaml
├── values.yaml
└── templates
    ├── api-deployment.yaml
    ├── api-service.yaml
    ├── postgres-deployment.yaml
    ├── postgres-service.yaml
    ├── redis-deployment.yaml
    └── redis-service.yaml
```

---

# Validate Helm Chart

Run Helm lint to verify chart structure:

```
helm lint helmcharts/novapay
```

Render Kubernetes manifests locally:

```
helm template novapay helmcharts/novapay
```

---

# Deploy to Kubernetes

Once Docker images are available and a cluster is running:

```
helm install novapay helmcharts/novapay
```

Check running resources:

```
kubectl get pods
kubectl get svc
```

---

# Current Scope

The Helm chart currently deploys the backend core:

- PostgreSQL
- Redis
- API

Additional services planned for later expansion:

- Web User Portal
- Web Merchant Portal
- Worker service
- MinIO (object storage)
- MailHog (SMTP testing)

---

# Purpose

This Helm chart demonstrates how the NovaPay platform can transition from Docker Compose to a Kubernetes-native deployment model.

It provides a foundation for future production deployment on platforms such as:

- AWS EKS
- GKE
- AKS
- On-prem Kubernetes clusters
