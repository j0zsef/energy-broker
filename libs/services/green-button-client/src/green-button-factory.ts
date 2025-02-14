import { GenericGreenButtonProvider } from './providers/generic-green-button-provider';
import { GreenButtonService } from './green-button-service';
import axios from 'axios';

export class GreenButtonFactory {
  static create(provider: string, baseUrl: string): GreenButtonService {
    // might need to extract this to an axios setup library
    const httpClient = axios.create();

    switch (provider) {
      default:
        return new GenericGreenButtonProvider(httpClient, baseUrl);
    }
  }
}
