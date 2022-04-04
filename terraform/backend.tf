terraform {
  backend "s3" {
    bucket = "mosho-prd-tfstate"
    key    = "terraform.tfstate"
    region = "ap-northeast-1"
  }
}
