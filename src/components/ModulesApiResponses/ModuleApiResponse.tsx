import UptimeKuma from './UptimeKuma';

export default function ModuleApiResponse(props: any) {
    const { service } = props;

    switch (service.type) {
        case 'Uptime Kuma':
            return (
                <UptimeKuma url={service.url} dashboard={service.dashboard} />
            );

        default:
            return null;
    }
}
