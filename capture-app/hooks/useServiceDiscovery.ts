import { useEffect, useRef, useState } from 'react';
import UdpSocket from 'react-native-udp';

const BEACON_PORT = 4748;

export interface DiscoveredService {
  id: string;
  name: string;
  host: string;
  port: number;
  fullName: string;
}

/**
 * Listens for UDP beacon packets broadcast by the Airframe Receiver desktop app.
 * The desktop sends JSON to 255.255.255.255:4748 every 2 seconds:
 *   { "name": "Airframe Receiver", "host": "192.168.x.x", "port": 4747 }
 *
 * This replaces the previous mDNS / Zeroconf approach which was unreliable
 * on Windows (firewall, library compatibility) and failed on hotspot topologies.
 */
export function useServiceDiscovery(): {
  services: DiscoveredService[];
  scanning: boolean;
  rescan: () => void;
} {
  const socketRef = useRef<ReturnType<typeof UdpSocket.createSocket> | null>(null);
  const [services, setServices] = useState<DiscoveredService[]>([]);
  const [scanning, setScanning] = useState(true);

  const openSocket = () => {
    // Clean up any existing socket
    if (socketRef.current) {
      try { socketRef.current.close(); } catch {}
      socketRef.current = null;
    }

    setServices([]);
    setScanning(true);

    const socket = UdpSocket.createSocket({ type: 'udp4', reusePort: true });
    socketRef.current = socket;

    socket.on('message', (data: Buffer) => {
      try {
        const beacon = JSON.parse(data.toString()) as {
          name: string;
          host: string;
          port: number;
        };

        if (!beacon.host || !beacon.port) return;

        const fullName = `${beacon.name}._airframe._tcp`;

        setServices((prev) => {
          // Deduplicate by host — update if already seen
          const existing = prev.findIndex((s) => s.host === beacon.host);
          if (existing !== -1) return prev; // already listed
          return [
            ...prev,
            {
              id: fullName,
              name: beacon.name ?? 'Airframe Receiver',
              host: beacon.host,
              port: beacon.port,
              fullName,
            },
          ];
        });
      } catch {
        // Malformed packet — ignore
      }
    });

    socket.on('error', (err: Error) => {
      console.warn('[udp-beacon] socket error:', err.message);
      setScanning(false);
    });

    socket.bind(BEACON_PORT, () => {
      // Socket is bound — we are now listening for beacons
      console.log(`[udp-beacon] Listening on port ${BEACON_PORT}`);
    });
  };

  useEffect(() => {
    openSocket();

    return () => {
      if (socketRef.current) {
        try { socketRef.current.close(); } catch {}
        socketRef.current = null;
      }
    };
  }, []);

  return { services, scanning, rescan: openSocket };
}
