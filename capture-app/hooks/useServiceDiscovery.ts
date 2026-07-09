import { useEffect, useRef, useState } from 'react';
// @ts-ignore — react-native-zeroconf has no bundled types
import Zeroconf from 'react-native-zeroconf';

export interface DiscoveredService {
  id: string;
  name: string;
  host: string;
  port: number;
  fullName: string;
}

/**
 * Scans the local network for `_airframe._tcp.` services published by the
 * desktop Airframe Receiver via mDNS / Bonjour.
 */
export function useServiceDiscovery(): {
  services: DiscoveredService[];
  scanning: boolean;
  rescan: () => void;
} {
  const zeroconfRef = useRef<Zeroconf | null>(null);
  const [services, setServices] = useState<DiscoveredService[]>([]);
  const [scanning, setScanning] = useState(true);

  const startScan = () => {
    const zeroconf = zeroconfRef.current;
    if (!zeroconf) return;
    setScanning(true);
    zeroconf.scan('_airframe._tcp.', 'tcp.', 'local.');
  };

  useEffect(() => {
    const zeroconf = new Zeroconf();
    zeroconfRef.current = zeroconf;

    const onResolved = (service: any) => {
      setServices((prev) => {
        if (prev.some((s) => s.fullName === service.fullName)) return prev;
        return [
          ...prev,
          {
            id: service.fullName,
            name: service.name,
            host: service.host,
            port: service.port,
            fullName: service.fullName,
          },
        ];
      });
    };

    const onError = (err: unknown) => {
      console.warn('[zeroconf] error', err);
      setScanning(false);
    };

    const onStop = () => setScanning(false);

    zeroconf.on('resolved', onResolved);
    zeroconf.on('error', onError);
    zeroconf.on('stop', onStop);

    startScan();

    return () => {
      zeroconf.removeListener('resolved', onResolved);
      zeroconf.removeListener('error', onError);
      zeroconf.removeListener('stop', onStop);
      zeroconf.stop();
    };
  }, []);

  return { services, scanning, rescan: startScan };
}
