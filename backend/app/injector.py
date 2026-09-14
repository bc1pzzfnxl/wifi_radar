import time
import threading
from typing import Optional
from scapy.all import Dot11, Dot11ProbeReq, Dot11Elt, RadioTap, sendp
from .models import RadarConfig

class FrameInjector:
    def __init__(self, config: RadarConfig):
        self.config = config
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.packets_sent = 0
        self.rate_counter = 0
        self.last_rate_check = time.time()
        self.current_rate = 0
        self.last_error: Optional[str] = None
        self.src_mac = "00:c0:ca:97:d2:fb"

    def start(self):
        if self.running:
            return
        self.running = True
        self.last_error = None
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False
        self.last_error = None
        self.current_rate = 0
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=0.5)
        self.thread = None

    def _run_loop(self):
        while self.running:
            start_time = time.time()
            try:
                frame = RadioTap() / Dot11(
                    type=0,
                    subtype=4,
                    addr1="ff:ff:ff:ff:ff:ff",
                    addr2=self.src_mac,
                    addr3="ff:ff:ff:ff:ff:ff"
                ) / Dot11ProbeReq() / Dot11Elt(ID="SSID", info="")
                sendp(frame, iface=self.config.interface, count=1, verbose=False)
                self.packets_sent += 1
                self.rate_counter += 1
                self.last_error = None
            except Exception as e:
                if self.running:
                    self.last_error = f"Injection error: {e}"

            now = time.time()
            if now - self.last_rate_check >= 1.0:
                self.current_rate = self.rate_counter
                self.rate_counter = 0
                self.last_rate_check = now

            target_interval = 1.0 / max(1, self.config.injection_rate)
            elapsed = time.time() - start_time
            sleep_time = max(0.001, target_interval - elapsed)
            time.sleep(sleep_time)
