provider "aws" {
    region  = local.default_region
    secret_key          = var.aws_secret_access_key
    access_key          = var.aws_access_key_id
    allowed_account_ids = [local.master_account_id]
}

provider "aws" {
    alias               = "acm"
    region              = "us-east-1" #this needs to be us-east-1, do not change
    secret_key          = var.aws_secret_access_key
    access_key          = var.aws_access_key_id
    allowed_account_ids = [local.master_account_id]
}

terraform {
    backend "s3" {
        bucket      = "stateful-trivialsec"
        key         = "terraform/website"
        region      = "ap-southeast-2"
    }
}
