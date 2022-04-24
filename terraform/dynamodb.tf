resource "aws_dynamodb_table" "envs_data" {
  name         = "mosho-${var.env}-ddb-envs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "location"
  range_key    = "timestamp"

  attribute {
    name = "location"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
}
