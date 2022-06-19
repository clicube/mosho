resource "aws_s3_bucket" "web" {
  bucket = "mosho-${var.env}-web"
}

resource "aws_s3_bucket_acl" "web" {
  bucket = aws_s3_bucket.web.bucket
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "web" {
  bucket = aws_s3_bucket.web.bucket
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.bucket
  policy = <<-POLICY
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::${aws_s3_bucket.web.bucket}/*"
        }
      ]
    }
  POLICY
}
