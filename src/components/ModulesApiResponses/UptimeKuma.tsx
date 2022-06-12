import axios from 'axios';
import { useEffect, useState } from 'react';
import { Skeleton, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
    IconCircleCheck as V,
    IconAlertCircle as W,
    IconX as X,
} from '@tabler/icons';

export default function UptimeKuma(props: any) {
    const { url, dashboard } = props;
    const [isLoading, setLoading] = useState(true);
    const [incident, setIncident] = useState(null);
    const [heartbeat, setHeartbeat] = useState(null);
    const [status, setStatus] = useState(null);
    const [uptime, setUptime] = useState(null);

    useEffect(() => {
        axios
            .get('/api/modules/uptimekuma', { params: { url, dashboard } })
            .then((response) => {
                setIncident(response.data.incident);
                setHeartbeat(response.data.heartbeat);
            })
            .catch((e) => {
                setIncident(null);
                setHeartbeat(null);
                showNotification({
                    autoClose: 5000,
                    title: <Text>Error</Text>,
                    color: 'red',
                    icon: <X />,
                    message: `could not get data from Uptime Kuma on ${url}.`,
                });
            });
    }, []);

    const getStatus = () => {
        let result = 'ok';
        let up = false;

        const lastHeartbeat = {};

        for (const id in heartbeat.heartbeatList) {
            const index = heartbeat.heartbeatList[id].length - 1;
            lastHeartbeat[id] = heartbeat.heartbeatList[id][index];
        }

      for (const id in lastHeartbeat) {
        const beat = lastHeartbeat[id];
        if (beat.status == 1) {
          up = true;
        }
      }

      if (!up) {
        result = 'nok';
      }
      return result;
    };

    useEffect(() => {
        if (heartbeat) {
            setLoading(false);
            setStatus(getStatus());
            const uptimeList = Object.values(heartbeat.uptimeList);
            setUptime(
                ((uptimeList.reduce((a, b) => a + b, 0) / uptimeList.length || 0) * 100).toFixed(1)
            );
        } else {
            setLoading(true);
        }
    }, [incident, heartbeat]);

    return <div style={{ display: 'flex', position: 'absolute', bottom: 3 }}>
                {isLoading
                    ? <Skeleton height={13} style={{ bottom: '10px' }} circle />
                    : <>
                        <Tooltip
                          radius="lg"
                          label={status === 'ok' ? 'All is ok' : 'Service seems not fully operationnal'}
                        >
                            {status === 'ok' ? <V /> : <W />}
                        </Tooltip>
                        <span style={{ marginLeft: '5px' }}>{uptime}%</span>
                      </>}
           </div>;
}
