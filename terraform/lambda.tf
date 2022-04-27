data "archive_file" "lambda_api" {
  type        = "zip"
  source_dir  = "../api/dist"
  output_path = "out/api.zip"
}

data "aws_ssm_parameter" "firebase_credential" {
  name = "mosho-${var.env}-param-firebase_credential"
}

resource "aws_iam_role" "lambda_api" {
  name = "mosho-${var.env}-role-lambda_api"

  assume_role_policy = <<-EOS
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Effect": "Allow"
        }
      ]
    }
  EOS
}

resource "aws_iam_policy" "lambda_api" {
  name = "mosho-${var.env}-policy-lambda_api"

  policy = <<-EOS
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "logs:PutLogEvents"
          ],
          "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/*:log-stream:*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream"
          ],
          "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "dynamodb:Query",
            "dynamodb:PutItem"
          ],
          "Resource": "arn:aws:dynamodb:*:${data.aws_caller_identity.self.account_id}:table/mosho-${var.env}-ddb-envs"
        }
      ]
    }
  EOS
}

resource "aws_iam_role_policy_attachment" "lambda_api" {
  role       = aws_iam_role.lambda_api.name
  policy_arn = aws_iam_policy.lambda_api.arn
}

resource "aws_lambda_permission" "lambda_permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}

resource "aws_lambda_function" "api" {
  function_name    = "mosho-${var.env}-function-api"
  filename         = data.archive_file.lambda_api.output_path
  source_code_hash = data.archive_file.lambda_api.output_base64sha256
  role             = aws_iam_role.lambda_api.arn
  handler          = "index.handler"
  runtime          = "nodejs14.x"
  timeout          = 20

  environment {
    variables = {
      FIREBASE_CREDENTIAL = data.aws_ssm_parameter.firebase_credential.value
    }
  }
}
