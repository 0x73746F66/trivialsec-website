resource "aws_cloudfront_origin_access_identity" "default" {
  comment = local.s3_bucket
}

resource "aws_cloudfront_distribution" "static_trivialsec" {
    wait_for_deployment = false

    origin {
        domain_name = "${local.s3_bucket}.s3.${local.default_region}.amazonaws.com"
        origin_id   = local.s3_origin_id
        connection_timeout      = 2
        connection_attempts     = 3
        origin_path             = "/static"

        s3_origin_config {
            origin_access_identity = aws_cloudfront_origin_access_identity.default.cloudfront_access_identity_path
        }
    }

    enabled             = true
    is_ipv6_enabled     = true
    default_root_object = "/static/index.html"
    aliases = [local.domain_name]

    default_cache_behavior {
        allowed_methods  = ["GET", "HEAD"]
        cached_methods   = ["GET", "HEAD"]
        target_origin_id = local.s3_origin_id
        compress         = true

        forwarded_values {
            query_string = false

            cookies {
                forward = "none"
            }
        }

        viewer_protocol_policy = "redirect-to-https"
        min_ttl                = 30
        default_ttl            = 900
        max_ttl                = 3600
    }

    price_class = "PriceClass_100"

    restrictions {
        geo_restriction {
            restriction_type = "blacklist"
            locations        = ["UA", "RU", "CN", "VN", "TH", "KP", "IR", "IQ", "IN", "NG", "SO", "SS", "YE", "ZM", "ZW", "AF", "BA", "BD", "CG", "CU", "CZ", "DM", "DO", "DZ", "ET", "GT", "GU", "HN", "HT"]
        }
    }

    tags = {
        Name = "Website"
        Environment = "Prod"
        Purpose = "Deploy"
        cost-center = "saas"
    }

    viewer_certificate {
        acm_certificate_arn            = local.acm_arn
        cloudfront_default_certificate = false
        minimum_protocol_version       = "TLSv1.2_2019"
        ssl_support_method             = "sni-only"
    }

    custom_error_response {
        error_code         = 404
        response_page_path = "/static/404.html"
    }
}
