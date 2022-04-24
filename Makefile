build:
	cd api && npm run build

plan:
	cd terraform && AWS_PROFILE=mosho-prd TF_VAR_env=prd terraform plan

apply:
	cd terraform && AWS_PROFILE=mosho-prd TF_VAR_env=prd terraform apply
