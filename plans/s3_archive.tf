resource "aws_s3_bucket" "archive_s3_bucket" {
  bucket         = "archive-${local.domain}"
  website_domain = local.archive_domain_name
  acl     = "private"
  versioning {
    enabled = true
  }
  lifecycle_rule {
    id      = "permanent_retention"
    enabled = true
    prefix  = "reports/"
    transition {
      days            = 92
      storage_class   = "GLACIER"
    }
    noncurrent_version_transition {
      days            = 1
      storage_class   = "GLACIER"
    }
    noncurrent_version_expiration {
      days            = 30
    }
  }
}

data "aws_iam_policy_document" "archive_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::archive-${local.domain}/*"]

    principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${local.master_account_id}:root"]
    }

  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::archive-${local.domain}"]

    principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${local.master_account_id}:root"]
    }
  }
}

resource "aws_s3_bucket_policy" "archive_resource_policy" {
    bucket = "archive-${local.domain}"
    policy = data.aws_iam_policy_document.archive_s3_policy.json
}

resource "aws_s3_bucket_public_access_block" "archive_resource_public_access_block" {
  bucket = aws_s3_bucket.archive_s3_bucket.id
  restrict_public_buckets = true
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
}
