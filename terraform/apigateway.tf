resource "aws_apigatewayv2_api" "api" {
  name          = "mosho-${var.env}-api-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://mosho-prd-web.s3.ap-northeast-1.amazonaws.com"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "api" {
  for_each  = toset(["GET", "POST", "PUT", "DELETE", "PATCH"])
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "${each.value} /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

