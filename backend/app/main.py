import asyncio
import json
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .models import RadarConfig, RadarTelemetry, CalibrationStatus, RadarTarget
from .engine import RadarEngine

engine = RadarEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.start()
    yield
    engine.stop()

app = FastAPI(title="AR9271 WiFi Radar API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "interface": engine.config.interface,
        "channel": engine.config.channel,
        "simulate_rf": engine.config.simulate_rf,
        "active_targets_count": len(engine.dsp.trackers)
    }

@app.get("/api/config", response_model=RadarConfig)
async def get_config():
    return engine.config

@app.post("/api/config", response_model=RadarConfig)
async def update_config(cfg: RadarConfig):
    engine.update_config(cfg)
    return engine.config

@app.post("/api/calibrate")
async def start_calibration():
    engine.trigger_calibration()
    return {"status": "started", "target_samples": engine.calib_target}

@app.get("/api/calibrate/status", response_model=CalibrationStatus)
async def get_calibration():
    return engine.get_calibration_status()

@app.get("/api/targets", response_model=List[RadarTarget])
async def get_targets():
    return engine.dsp.prune_stale_targets()

@app.websocket("/ws/radar")
async def websocket_radar(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            frame = engine.generate_telemetry_frame()
            await websocket.send_text(frame.model_dump_json())
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
