provider "aws" {
    region  = local.default_region
    profile = local.default_profile

    allowed_account_ids = [local.master_account_id]
}

provider "aws" {
    alias   = "acm"
    region  = "us-east-1" #this needs to be us-east-1, do not change
    profile = local.default_profile

    allowed_account_ids = [local.master_account_id]
}

terraform {
    backend "s3" {
        bucket = "static-trivialsec"
        key    = "terraform/statefiles/website"
        region = "ap-southeast-2"
    }
}