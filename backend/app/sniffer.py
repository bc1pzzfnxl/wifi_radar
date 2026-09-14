import time
import threading
from typing import Callable, Optional
from scapy.all import sniff, Dot11, RadioTap
from .models import RadarConfig

class PacketSniffer:
    def __init__(self, config: RadarConfig, packet_callback: Callable[[str, float], None]):
        self.config = config
        self.packet_callback = packet_callback
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.packets_captured = 0
        self.capture_rate = 0
        self._rate_counter = 0
        self._last_rate_time = time.time()

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_sniff, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        self.thread = None

    def _run_sniff(self):
        def _handler(pkt):
            if not self.running:
                return True
            try:
                if pkt.haslayer(Dot11):
                    rssi = None
                    if hasattr(pkt, "dBm_AntSignal"):
                        rssi = float(pkt.dBm_AntSignal)
                    elif pkt.haslayer(RadioTap) and hasattr(pkt[RadioTap], "dBm_AntSignal"):
                        rssi = float(pkt[RadioTap].dBm_AntSignal)
                    
                    if rssi is not None:
                        src = pkt.addr2
                        if src:
                            self.packets_captured += 1
                            self._rate_counter += 1
                            self.packet_callback(src, rssi)

                now = time.time()
                if now - self._last_rate_time >= 1.0:
                    self.capture_rate = self._rate_counter
                    self._rate_counter = 0
                    self._last_rate_time = now
            except Exception:
                pass

        try:
            sniff(
                iface=self.config.interface,
                prn=_handler,
                store=False,
                stop_filter=lambda p: not self.running
            )
        except Exception:
            self.running = False
