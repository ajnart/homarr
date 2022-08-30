import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RadarrService {
  public async getCalendar(url: string) {
    const response = await axios.get(`${url}/api/v3/calendar`);

    console.log(response.data);
  }
}
