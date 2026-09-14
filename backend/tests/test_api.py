import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_status():
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"

def test_api_config_get_and_update():
    res = client.get("/api/config")
    assert res.status_code == 200
    cfg = res.json()
    assert "channel" in cfg
    
    cfg["channel"] = 11
    res_update = client.post("/api/config", json=cfg)
    assert res_update.status_code == 200
    assert res_update.json()["channel"] == 11

def test_api_calibrate():
    res = client.post("/api/calibrate")
    assert res.status_code == 200
    assert res.json()["status"] == "started"

    status_res = client.get("/api/calibrate/status")
    assert status_res.status_code == 200
    assert "in_progress" in status_res.json()
