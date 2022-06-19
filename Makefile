build:
	cd api && npm run build

plan-tf:
	cd terraform && AWS_PROFILE=mosho-prd TF_VAR_env=prd terraform plan

plan: plan-tf

apply-tf:
	cd terraform && AWS_PROFILE=mosho-prd TF_VAR_env=prd terraform apply --auto-approve

apply-web:
	cd web && AWS_PROFILE=mosho-prd aws s3 sync . s3://mosho-prd-web/

apply: apply-tf apply-web