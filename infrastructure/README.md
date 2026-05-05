# Infrastructure Learning Scaffold

This folder provides Terraform examples to deploy this project on AWS and GCP across two patterns:

- VM in a VPC (`EC2` and `GCE`)
- Kubernetes in a VPC (`EKS` and `GKE`)

For PostgreSQL:

- AWS uses **Amazon Aurora PostgreSQL**.
- GCP equivalent in this scaffold is **Cloud SQL for PostgreSQL**.

## Layout

- `terraform/modules/`: reusable Terraform modules
- `terraform/aws/vpc-ec2-aurora`: EC2 + Aurora PostgreSQL
- `terraform/aws/eks-aurora`: EKS + Aurora PostgreSQL
- `terraform/gcp/vpc-gce-cloudsql`: GCE + Cloud SQL PostgreSQL
- `terraform/gcp/gke-cloudsql`: GKE + Cloud SQL PostgreSQL

## Quick Start

1. Pick one stack directory.
2. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill values.
3. Run:

```bash
terraform init
terraform plan
terraform apply
```

## Kubernetes Follow-up

After creating EKS or GKE, use stack outputs (`jdbc_url`, DB username/password) to set backend Helm values or env vars so your Spring app points to Aurora/Cloud SQL.

`application.yml` already reads:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## Notes

- These are intentionally explicit learning templates, not production-hardened blueprints.
- For EKS/GKE stacks, the app deployment into Kubernetes is left to your Helm charts under:
  - `devo_carre/charts`
  - `client-application/charts`
