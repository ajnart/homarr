import { SelectItem } from '@mantine/core';

export const StatusCodes: SelectItem[] = [
  { value: '200', label: '200 - OK', group: 'Sucessful responses' },
  { value: '202', label: '202 - Accepted', group: 'Sucessful responses' },
  { value: '204', label: '204 - No Content', group: 'Sucessful responses' },
  { value: '301', label: '301 - Moved Permanently', group: 'Redirection responses' },
  { value: '302', label: '302 - Found / Moved Temporarily', group: 'Redirection responses' },
  { value: '304', label: '304 - Not Modified', group: 'Redirection responses' },
  { value: '307', label: '307 - Temporary Redirect', group: 'Redirection responses' },
  { value: '308', label: '308 - Permanent Redirect', group: 'Redirection responses' },
  { value: '400', label: '400 - Bad Request', group: 'Client error responses' },
  { value: '401', label: '401 - Unauthorized', group: 'Client error responses' },
  { value: '403', label: '403 - Forbidden', group: 'Client error responses' },
  { value: '404', label: '404 - Not Found', group: 'Client error responses' },
  { value: '405', label: '405 - Method Not Allowed', group: 'Client error responses' },
  { value: '408', label: '408 - Request Timeout', group: 'Client error responses' },
  { value: '410', label: '410 - Gone', group: 'Client error responses' },
  { value: '429', label: '429 - Too Many Requests', group: 'Client error responses' },
  { value: '500', label: '500 - Internal Server Error', group: 'Server error responses' },
  { value: '502', label: '502 - Bad Gateway', group: 'Server error responses' },
  { value: '503', label: '503 - Service Unavailable', group: 'Server error responses' },
  { value: '504', label: '504 - Gateway Timeout Error', group: 'Server error responses' },
];
