data "aws_cloudfront_canonical_user_id" "current" {}

resource "aws_s3_bucket" "content_s3_bucket" {
  bucket         = local.s3_bucket
  website_domain = local.domain_name

  grant {
    type        = "CanonicalUser"
    permissions = ["FULL_CONTROL"]
    id          = data.aws_canonical_user_id.current.id
  }
  # CloudFront log delivery
  grant {
    type        = "CanonicalUser"
    permissions = ["READ", "READ_ACP"]
    id          = aws_cloudfront_distribution.static_trivialsec.id
  }
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${local.s3_bucket}/*"]

    principals {
        type        = "AWS"
        identifiers = [aws_cloudfront_origin_access_identity.default.iam_arn]
    }

  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${local.s3_bucket}"]

    principals {
        type        = "AWS"
        identifiers = [aws_cloudfront_origin_access_identity.default.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "oai" {
    bucket = local.s3_bucket
    policy = data.aws_iam_policy_document.s3_policy.json
}