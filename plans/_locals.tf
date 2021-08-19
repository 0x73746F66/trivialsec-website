locals {
    default_region      = "ap-southeast-2"
    master_account_id   = 984310022655
    hosted_zone         = "Z04169281YCJD2GS4F5ER"
    domain              = "trivialsec"
    apex_domain         = "trivialsec.com"
    www_domain_name     = "www.${local.apex_domain}"
    archive_domain_name = "archive.${local.apex_domain}"
    s3_origin_id        = "${local.domain}_s3_origin"
    acm_arn             = "arn:aws:acm:us-east-1:${local.master_account_id}:certificate/8ba67bad-47e9-4936-a860-d47ae4bafba6" #this needs to be us-east-1, do not change
}
