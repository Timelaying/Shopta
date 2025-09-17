# Route Optimizer Service

This Python microservice exposes REST APIs for suggesting efficient
shopping routes. The optimizer considers proximity, user-defined store
priorities and expected traffic conditions. An additional AI-assisted
endpoint layers stochastic search on top of the greedy baseline to
provide narrative insights alongside the recommended itinerary.

## Usage

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Start the service:

```bash
uvicorn route_optimizer_service.main:app --reload
```

3. Send a request:

```bash
curl -X POST http://localhost:8000/optimize-route \
    -H "Content-Type: application/json" \
    -d '{"start_lat":0,"start_lng":0,"stores":[{"identifier":"A","lat":0,"lng":1,"store_type":"pharmacy","service_time":5,"priority":1}]}'
```

To receive the AI-enhanced recommendation and insights, post to
`/ai-suggest-route` and include optional `iterations` and `random_seed`
fields:

```bash
curl -X POST http://localhost:8000/ai-suggest-route \
    -H "Content-Type: application/json" \
    -d '{
          "start_lat":0,
          "start_lng":0,
          "iterations":200,
          "stores":[{"identifier":"A","lat":0,"lng":1,"store_type":"pharmacy","service_time":5,"priority":1}]
        }'
```

The service optionally integrates with the Google Maps Directions API
when a `google_api_key` is provided in the request and the
`googlemaps` package is installed.
