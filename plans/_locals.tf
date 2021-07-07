locals {
    default_profile     = "trivialsec"
    default_region      = "ap-southeast-2"
    master_account_id   = 814504268053
    hosted_zone         = "Z04960145RBVQW3AG0QR"
    domain              = "trivialsec"
    apex_domain         = "trivialsec.com"
    www_domain_name     = "www.${local.apex_domain}"
    archive_domain_name = "archive.${local.apex_domain}"
    s3_origin_id        = "${local.domain}_s3_origin"
    acm_arn             = "arn:aws:acm:us-east-1:${local.master_account_id}:certificate/ec695b96-e9e8-4f14-ab15-92b4bfb8b8b0" #this needs to be us-east-1, do not change
}
