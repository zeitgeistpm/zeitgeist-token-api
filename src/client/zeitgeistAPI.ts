import { BaseApi, IZeitgeistApi } from './baseApi';
import { networks } from '../const';

export class ZeitgeistApi extends BaseApi implements IZeitgeistApi {
    constructor(endpoint = networks.zeitgeist.endpoint) {
        super(endpoint);
    }
}
