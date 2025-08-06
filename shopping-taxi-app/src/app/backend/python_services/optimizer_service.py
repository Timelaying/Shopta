from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

class Stop(BaseModel):
    store_id: int
    latitude: float
    longitude: float

class OptimizeRequest(BaseModel):
    stops: List[Stop]

app = FastAPI()

@app.post("/optimize")
async def optimize(req: OptimizeRequest):
    sorted_stops = sorted(req.stops, key=lambda s: s.store_id)
    return {"stops": sorted_stops}
