package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
	"go.uber.org/zap"
)

var logger *zap.Logger

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	lc, _ := lambdacontext.FromContext(ctx)
	logger.Debug("HandleRequest", zap.Any("context", lc))
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"content-type": "application/json",
		},
		Body: json.Marshal(nil),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}

func init() {
	logger, _ = zap.NewProduction()
}
