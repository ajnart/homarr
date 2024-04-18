import axios from 'axios';
import Consola from 'consola';
import https from 'https';
import { findAppProperty } from '~/tools/client/app-properties';
import { ConfigAppType } from '~/types/app';
import { ResourceData, ResourceSummary } from '~/widgets/health-monitoring/cluster/types';

export async function makeProxmoxStatusAPICall(app: ConfigAppType, input: any) {
  if (!app) {
    Consola.error(`App 'proxmox' not found for configName '${input.configName}'`);
    return null;
  }

  const apiKey = findAppProperty(app, 'apiKey');
  if (!apiKey) {
    Consola.error(`'proxmox': Missing API key. Please check the configuration.`);
    return null;
  }

  const appUrl = new URL('api2/json/cluster/resources', app.url);
  const agent = input.ignoreCerts
    ? new https.Agent({ rejectUnauthorized: false, requestCert: false })
    : new https.Agent();

  const result = await axios
    .get(appUrl.toString(), {
      headers: {
        Authorization: `PVEAPIToken=${apiKey}`,
      },
      httpsAgent: agent,
    })
    .catch((error) => {
      Consola.error(
        `'proxmox': Error accessing service API: '${appUrl}'. The following error was returned: ${error}`
      );
      return null;
    })
    .then((res) => {
      let resources: ResourceSummary = { vms: [], lxcs: [], nodes: [], storage: [] };

      if (!res) return null;

      res.data.data.forEach((item: any) => {
        if (input.filterNode === '' || input.filterNode === item.node) {
          let resource: ResourceData = {
            id: item.id,
            cpu: item.cpu ? item.cpu : 0,
            maxCpu: item.maxcpu ? item.maxcpu : 0,
            maxMem: item.maxmem ? item.maxmem : 0,
            mem: item.mem ? item.mem : 0,
            name: item.name,
            node: item.node,
            status: item.status,
            running: false,
            type: item.type,
            uptime: item.uptime,
            vmId: item.vmid,
            netIn: item.netin,
            netOut: item.netout,
            diskRead: item.diskread,
            diskWrite: item.diskwrite,
            disk: item.disk,
            maxDisk: item.maxdisk,
            haState: item.hastate,
            storagePlugin: item.plugintype,
            storageShared: item.shared == 1,
          };
          if (item.template == 0) {
            if (item.type === 'qemu') {
              resource.running = resource.status === 'running';
              resources.vms.push(resource);
            } else if (item.type === 'lxc') {
              resource.running = resource.status === 'running';
              resources.lxcs.push(resource);
            }
          } else if (item.type === 'node') {
            resource.name = item.node;
            resource.running = resource.status === 'online';
            resources.nodes.push(resource);
          } else if (item.type === 'storage') {
            resource.name = item.storage;
            resource.running = resource.status === 'available';
            resources.storage.push(resource);
          }
        }
      });

      // results must be sorted; proxmox api result order can change dynamically,
      // so sort the data to keep the item positions consistent
      const sorter = (a: ResourceData, b: ResourceData) => {
        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      };

      resources.nodes.sort(sorter);
      resources.lxcs.sort(sorter);
      resources.storage.sort(sorter);
      resources.vms.sort(sorter);

      return resources;
    });

  return result;
}
