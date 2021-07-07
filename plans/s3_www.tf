resource "aws_s3_bucket" "content_s3_bucket" {
  bucket         = "assets-${local.domain}"
  website_domain = local.www_domain_name
  acl     = "private"
  versioning {
    enabled = true
  }
  lifecycle_rule {
    id      = "quarterly_retention"
    enabled = true
    prefix = "reports/"

    transition {
      days            = 30
      storage_class   = "STANDARD_IA"
    }
    expiration {
      days = 92
    }
    noncurrent_version_expiration {
      days = 1
    }
  }
  replication_configuration {
    role = aws_iam_role.replication.arn
    rules {
      id     = "asset-archive-replication"
      prefix = "reports/"
      status = "Enabled"
      destination {
        bucket        = "${aws_s3_bucket.archive_s3_bucket.arn}"
        storage_class = "ONEZONE_IA"
      }
    }
  }
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::assets-${local.domain}/*"]

    principals {
        type        = "AWS"
        identifiers = [aws_cloudfront_origin_access_identity.default.iam_arn]
    }

  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::assets-${local.domain}"]

    principals {
        type        = "AWS"
        identifiers = [aws_cloudfront_origin_access_identity.default.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "oai" {
    bucket = "assets-${local.domain}"
    policy = data.aws_iam_policy_document.s3_policy.json
}

resource "aws_s3_bucket_public_access_block" "assets_resource_public_access_block" {
  bucket = aws_s3_bucket.content_s3_bucket.id
  restrict_public_buckets = true
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
}


resource "aws_iam_policy" "replication" {
  name = "assets-archive-replication"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetReplicationConfiguration",
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.content_s3_bucket.arn}"
      ]
    },
    {
      "Action": [
        "s3:GetObjectVersionForReplication",
        "s3:GetObjectVersionAcl",
         "s3:GetObjectVersionTagging"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.content_s3_bucket.arn}/*"
      ]
    },
    {
      "Action": [
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags"
      ],
      "Effect": "Allow",
      "Resource": "${aws_s3_bucket.archive_s3_bucket.arn}/*"
    }
  ]
}
POLICY
}

resource "aws_iam_role" "replication" {
  name = "tf-iam-role-replication-12345"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
POLICY
}
resource "aws_iam_role_policy_attachment" "replication" {
  role       = aws_iam_role.replication.name
  policy_arn = aws_iam_policy.replication.arn
}
