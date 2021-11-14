resource "aws_route53_record" "www_a" {
    zone_id = local.hosted_zone
    name    = "www.${local.apex_domain}"
    type    = "A"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "www_aaaa" {
    zone_id = local.hosted_zone
    name    = "www.${local.apex_domain}"
    type    = "AAAA"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "assets_a" {
    zone_id = local.hosted_zone
    name    = "assets.${local.apex_domain}"
    type    = "A"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "assets_aaaa" {
    zone_id = local.hosted_zone
    name    = "assets.${local.apex_domain}"
    type    = "AAAA"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "apex_a" {
    zone_id = local.hosted_zone
    name    = local.apex_domain
    type    = "A"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "apex_aaaa" {
    zone_id = local.hosted_zone
    name    = local.apex_domain
    type    = "AAAA"

    alias {
        name                   = aws_cloudfront_distribution.assets_trivialsec.domain_name
        zone_id                = aws_cloudfront_distribution.assets_trivialsec.hosted_zone_id
        evaluate_target_health = false
    }
}
