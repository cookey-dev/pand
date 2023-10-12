import Api from './Api.js';
import strip from 'striptags';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import got, { PlainResponse } from 'got';

/**
 * Optional api requests (statistics/telemetry), reccomended to keep pandora happy
 */
class ApiOpt extends Api {
    constructor() {
        super();
    }
    /**
     * Signals a starting track
     */
    async started(): Promise<void> {
        if (!this.src || !this.ogSrc) return; // nbd
        await this.rest('/api/v1/event/started', {
            deviceProperties: this.deviceProperties(),
            deviceUuid: this.uuid,
            elapsedTime: 0,
            index: this.src.item.index,
            sourceId: this.ogSrc.pandoraId
        });
    }
    /**
     * Send on client start, unknown purpose
     */
    async getCreditCard(): Promise<void> {
        await this.rest('/api/v1/billing/getCreditCardV2');
    }
    /**
     * Send at a regular interval during playback
     */
    async radioHealth(striptags = true): Promise<string> {
        const res: PlainResponse = await got('https://www.pandora.com/radio-health', {
            method: 'POST',
            headers: {
                'User-Agent': this.ua,
                'Accept': 'application/json, text/plain, */*',
                'Connection': 'Keep-Alive'
            }
        }).text();
        return striptags ? strip(res) : res;
    }
    /**
     * Send whenever elapsed playback time of a song is a multiple of 60 (eg. 60, 120...)
     */
    async progress() {
        if (!this.src || !this.ogSrc) return;
        await this.rest('/api/v1/event/progress', {
            deviceProperties: this.deviceProperties(),
            deviceUuid: this.uuid,
            elapsedTime: this.time,
            index: this.src.item.index,
            sourceId: this.ogSrc.pandoraId
        });
    }
}

export default ApiOpt;