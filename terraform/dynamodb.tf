resource "aws_dynamodb_table" "envs_data" {
  name         = "mosho-${var.env}-ddb-envs_data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uid"
  range_key    = "timestamp"

  attribute {
    name = "uid"
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
