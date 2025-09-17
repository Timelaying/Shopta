"""FastAPI application exposing the route optimizer."""
from __future__ import annotations

from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .optimizer import Store, optimize_route
from .ai import ai_suggest_route


class StoreInput(BaseModel):
    identifier: str = Field(..., description="Unique store identifier")
    lat: float
    lng: float
    store_type: str
    service_time: float = Field(..., description="Time spent at the store in minutes")
    priority: int = Field(1, description="Lower values indicate higher priority")
    traffic_multiplier: float = Field(
        1.0, description="Multiplier representing expected traffic conditions"
    )


class OptimizeRequest(BaseModel):
    start_lat: float
    start_lng: float
    stores: List[StoreInput]
    google_api_key: Optional[str] = None


class StoreOutput(BaseModel):
    identifier: str
    lat: float
    lng: float
    store_type: str
    service_time: float
    priority: int
    traffic_multiplier: float


class OptimizeResponse(BaseModel):
    ordered_stores: List[StoreOutput]
    total_time: float


class AISuggestRequest(OptimizeRequest):
    iterations: int = Field(400, ge=10, le=5000)
    random_seed: Optional[int] = Field(
        default=None,
        description="Optional seed to obtain reproducible suggestions during testing.",
    )


class AISuggestResponse(BaseModel):
    ordered_stores: List[StoreOutput]
    total_time: float
    average_leg_time: float
    insights: List[str]


app = FastAPI(title="Route Optimizer Service")


@app.post("/optimize-route", response_model=OptimizeResponse)
async def optimize_route_endpoint(req: OptimizeRequest) -> OptimizeResponse:
    stores = [
        Store(
            identifier=s.identifier,
            lat=s.lat,
            lng=s.lng,
            store_type=s.store_type,
            service_time=s.service_time,
            priority=s.priority,
            traffic_multiplier=s.traffic_multiplier,
        )
        for s in req.stores
    ]
    ordered, total = optimize_route((req.start_lat, req.start_lng), stores, req.google_api_key)
    return OptimizeResponse(
        ordered_stores=[
            StoreOutput(
                identifier=s.identifier,
                lat=s.lat,
                lng=s.lng,
                store_type=s.store_type,
                service_time=s.service_time,
                priority=s.priority,
                traffic_multiplier=s.traffic_multiplier,
            )
            for s in ordered
        ],
        total_time=total,
    )


@app.post("/ai-suggest-route", response_model=AISuggestResponse)
async def ai_suggest_route_endpoint(req: AISuggestRequest) -> AISuggestResponse:
    stores = [
        Store(
            identifier=s.identifier,
            lat=s.lat,
            lng=s.lng,
            store_type=s.store_type,
            service_time=s.service_time,
            priority=s.priority,
            traffic_multiplier=s.traffic_multiplier,
        )
        for s in req.stores
    ]
    ordered, total, insights, avg_leg = ai_suggest_route(
        (req.start_lat, req.start_lng),
        stores,
        req.google_api_key,
        iterations=req.iterations,
        random_seed=req.random_seed,
    )
    return AISuggestResponse(
        ordered_stores=[
            StoreOutput(
                identifier=s.identifier,
                lat=s.lat,
                lng=s.lng,
                store_type=s.store_type,
                service_time=s.service_time,
                priority=s.priority,
                traffic_multiplier=s.traffic_multiplier,
            )
            for s in ordered
        ],
        total_time=total,
        average_leg_time=avg_leg,
        insights=insights,
    )


__all__ = ["app"]
