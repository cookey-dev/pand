// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import got, { PlainResponse } from 'got';
import UserAgent from 'user-agents';
import { CookieJar, Cookie } from 'tough-cookie';
import Login from './Login.js';
import * as gql from './graphql.js';
import { v4 as uuidv4 } from 'uuid';
import tmp from 'tmp';
import MPlayer from 'mplayer';
import tc from 'tinycolor2';
import { PandoraChecks } from './PandoraChecks.js';
import { IAudioMetadata, parseBuffer as musicMD } from 'music-metadata';
import { fileTypeFromBuffer as magic } from 'file-type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { writeFileSync as wf, readFileSync as rf } from 'fs';

class Api extends Login {
    csrf: string;
    ua: string;
    cookieJar: CookieJar;
    uuid: string;
    mplay;
    metad?: IAudioMetadata['format'];
    src?: PandoraRest.Source | PandoraRest.Peek;
    time: number;
    ogSrc?: PandoraRest.OgSource;
    icons = { // taken from https://github.com/r0wanda/pandora-term/blob/master/selectors.mjs
        play: '▶',
        pause: '⏸',
        skip: '⏭',
        rewind: '⏮',
        replay: '↩',
        thumbs: {
            up_alt: '👍',
            down_alt: '👎',
            up: '🖒',
            down: '🖓'
        },
        explicit: '🅴',
        clean: '🅲'
    }
    status: Status;
    version: number;
    constructor() {
        super();
        this.csrf = '';
        this.version = -1;
        this.cookieJar = new CookieJar();
        this.ua = new UserAgent().toString();
        this.uuid = uuidv4();
        this.mplay = new MPlayer();
        this.time = 0;
        this.status = {
            muted: false,
            playing: false,
            volume: 0,
            duration: 0,
            fullscreen: false,
            subtitles: false,
            filename: '',
            title: ''
        }

        this.mplay.volume(this.getVolume());
        this.mplay.on('status', (st: Status) => this.status = st);
        this.mplay.on('time', (sec: number) => {
            this.time = sec;
        });
    }
    /**
     * TODO: implement
     * @returns The user-set volume
     */
    getVolume(): PandoraTypes.Percentage { // TODO: Save volume
        return 1;
    }
    /**
     * Generic API error message
     * @returns API error message
     */
    apiError() {
        return new Error('API response was invalid')
    }
    /**
     * Initialize class
     */
    async init(): Promise<void> {
        await super.init();
        await this.initCsrf();
        await this.checkCompat();
        //console.error(await this.collection());
        //console.error(await this.current());
    }
    /**
     * Get csrftoken cookie from the Pandora website through a head request, and save as variable
     */
    async initCsrf() {
        const res: PlainResponse = await got('https://www.pandora.com', {
            method: 'HEAD'
        });
        if (!res.headers['set-cookie']) throw new Error('Pandora HEAD request did not contain a set-cookie header');
        for (const _c of res.headers['set-cookie']) {
            if (!_c) continue;
            const parsed = Cookie.parse(_c);
            if (!parsed) continue;
            const c = parsed.toJSON();
            if (c.key === 'csrftoken') {
                this.csrf = c.value;
                break;
            }
        }
        if (!this.csrf) throw new Error('No CSRF token could be obtained');
        await this.cookieJar.setCookie(`csrftoken=${this.csrf}`, 'https://www.pandora.com');
    }

    /**
     * Decrypt Pandora audio through an XOR cipher
     * @param rawData Buffer of encoded audio data
     * @param rawKey Encoded 64-byte encryption key
     * @returns Uint8Array of decrypted audio data
     */
    async decode(rawData: Buffer, rawKey: PandoraTypes.XORKey): Promise<Uint8Array> {
        // Parse key
        rawKey = atob(rawKey); // atob must be used, not Buffer.from
        const key = new Uint8Array(new ArrayBuffer(rawKey.length));
        for (let i = 0; i < rawKey.length; i++) {
            key[i] = rawKey.charCodeAt(i);
        }

        // Decode data
        const view = new Uint8Array(rawData);
        const keyView = new Uint8Array(new ArrayBuffer(key.byteLength));
        keyView.set(key);
        const res = new Uint8Array(new ArrayBuffer(rawData.byteLength));
        const curBufLen = rawData.byteLength;
        for (let i = 0; i < curBufLen; i++) {
            res[i] = keyView[i % keyView.length] ^ view[i];
        }
        console.error(await magic(res));
        return res;
    }

    /**
     * Play audio through MPlayer
     * @param buf Uint8Array or Buffer of audio data
     */
    async playAudio(buf: Uint8Array | Buffer) {
        this.metad = (await musicMD(buf)).format;
        const fname = tmp.fileSync().name;
        wf(fname, buf);
        this.mplay.openFile(fname);
        this.mplay.volume(this.getVolume());
    }
    /**
     * Pulls track explicitness from cache
     * @returns Pandora representation of explicitness (documented in ptypes.d.ts as PandoraTypes.Explicit)
     */
    getExplicitness(): PandoraTypes.Explicit {
        let an;
        try {
            an = this.getTrackAnnotation();
        } catch {
            return 'NONE';
        }
        return an.explicitness;
    }
    /**
     * Represent explicitness as an icon (pulls from cache)
     * @returns An unicode icon representing the level of explicitness
     */
    getExplicitIcon(): string {
        const ex = this.getExplicitness();
        switch (ex) {
            case 'NONE':
                return '';
            case 'EXPLICIT':
                return this.icons.explicit;
            case 'CLEAN':
                return this.icons.clean;
            default:
                return '';
        }
    }
    /**
     * getExplicitIcon, but with color using blessed.js tags
     * @returns An unicode icon representing the level of explicitness with blessed tags for color
     */
    blessedExplicitIcon() {
        const ex = this.getExplicitIcon();
        switch (ex) {
            case this.icons.explicit:
                return `{red-fg}${ex}{/red-fg}`;
            case this.icons.clean:
                return `{gray-fg}${ex}{/gray-fg}`;
            default:
                return ex;
        }
    }
    /**
     * Get the song name (with blessed.js tags by default)
     * @param blessed Whether or not to use blessed.js tags for color
     * @returns A string of the song name + explicitness (or "Buffering")
     */
    getSong(blessed = true) {
        const ex = blessed ? this.blessedExplicitIcon() : this.getExplicitIcon();
        return this.src ? `${this.src.item.songName} | ${this.src.item.artistName} ${ex}` : 'Buffering';
    }

    /**
     * Make an generic Pandora api call
     * @param path The url path (https://www.pandora.com will be prepended by default)
     * @param json POST data to send (in json format)
     * @param headers Additional headers to send
     * @returns Pandora api response
     */
    async rest(path: string, json = {}, headers = {}): Promise<PandoraRest> {
        const url = new URL('https://www.pandora.com/');
        url.pathname = path;
        const res: PandoraRest = await got(url.href, {
            method: 'POST',
            headers: {
                'X-CsrfToken': this.csrf,
                'X-AuthToken': this.token,
                'Content-Type': 'application/json',
                'User-Agent': this.ua,
                'Accept': 'application/json, text/plain, */*',
                'Connection': 'keep-alive',
                ...headers
            },
            json,
            cookieJar: this.cookieJar
        }).json();
        return res;
    }
    /**
     * Fetch (and decode if needed) an audio file from Pandora, and play it
     * @param url Audio url to download
     * @param key Encryption key if needed
     */
    async audio(url: string, key?: string) {
        const res: Buffer = await got(url, {
            method: 'GET',
            headers: {
                'Connection': 'keep-alive',
                'User-Agent': this.ua
            }
        }).buffer();
        const aud = key ? await this.decode(res, key) : res;
        await this.playAudio(aud);
    }
    /**
     * Make an GraphQL api call
     * @param json POST data
     * @returns The response
     */
    async graphql(json: object): Promise<PandoraRest.GraphQL> {
        const res = await this.rest('/api/v1/graphql/graphql', json);
        if (!PandoraChecks.Rest.isGraphQL(res)) throw new Error('API response was not GraphQL');
        return res;
    }
    async getStations(): Promise<PandoraRest.Stations> {
        const res = await this.rest('/api/v1/station/getStations', {
            pageSize: 250
        });
        if (!PandoraChecks.Rest.isStations(res)) throw this.apiError();
        return res;
    }
    async infoV2(): Promise<PandoraRest.Info> {
        const res = await this.rest('/api/v1/billing/infoV2');
        if (!PandoraChecks.Rest.isInfo(res)) throw this.apiError();
        return res;
    }
    async getSortedPlaylists(): Promise<PandoraRest.Playlists> {
        const res = await this.rest('/api/v6/collections/getSortedPlaylists', {
            allowedTypes: ['TR', 'AM'],
            isRecentModifiedPlaylists: false,
            request: {
                annotationLimit: 100,
                limit: 1000,
                sortOrder: 'MOST_RECENT_MODIFIED'
            }
        });
        if (!PandoraChecks.Rest.isPlaylists(res)) throw this.apiError();
        return res;
    }
    async getItems(): Promise<PandoraRest.Items> {
        const res = await this.rest('/api/v6/collections/getItems', {
            request: {
                limit: 1000
            }
        });
        if (!PandoraChecks.Rest.isItems(res)) throw this.apiError();
        return res;
    }
    async getVersion() {
        const res = await this.rest('/api/v5/collection/getVersion');
        if (!PandoraChecks.Rest.isVersion(res)) throw this.apiError();
        const v = parseInt(res);
        this.version = v;
        return v;
    }
    async getSortedByTypes(offset = 0, limit = 40) {
        const res = await this.rest('/api/v6/collections/getSortedByTypes', {
            request: {
                annotationLimit: limit,
                limit,
                offset,
                sortOrder: 'MOST_RECENT_ADDED',
                typePrefixes: ['ALL']
            }
        });
        if (!PandoraChecks.Rest.isSortedTypes(res)) throw this.apiError();
        return res;
    }
    annotateItems(annotations: { [key: PandoraTypes.Id]: Annotations }, items: Array<PandoraSimpleItem>) {
        return items.map(it => {
            return {
                ...it,
                ...(annotations[it.pandoraId] ?? {})
            }
        });
    }
    async curateStations(stations: PandoraRest.Stations): Promise<Array<PandoraGraphQLEntity>> {
        const res = await this.graphql({
            operationName: 'GetStationCuratorsWeb',
            query: gql.STATION_CURATORS,
            variables: JSON.stringify({
                pandoraIds: stations.stations.map(s => s.stationFactoryPandoraId)
            })
        });
        if (!res.data.entities) throw this.apiError();
        return res.data.entities;
    }
    async recentlyPlayed(): Promise<Array<PandoraComplexItems.RecentlyPlayed>> {
        const res = await this.graphql({
            operationName: 'GetRecentlyPlayedSourcesWeb',
            query: gql.RECENTLY_PLAYED,
            variables: {
                limit: 10,
                types: gql.RECENTLY_PLAYED_TYPES
            }
        });
        if (!res.data.recentlyPlayedSources) throw this.apiError();
        return res.data.recentlyPlayedSources.items;
    }
    /**
     * Convert an art object from the Pandora api into a map
     * @param art Direct api response
     * @returns The decoded art map
     */
    parseArt(art: Array<OtherPandoraInterfaces.Art>): Parsed.Art {
        const res: Map<string, string> = new Map();
        for (const a of art) res.set(a.size.toString(), a.url);
        return res;
    }
    /**
     * Parses "thor layers" obtained from the Pandora rest api.
     * @remarks
     * Thor layers are constructed in this format: _,:grid(images/most/of/art/url/path,images/url...)
     * The art urls are incomplete, missing the p-cdn url, also leaving out the filename (_widthW_heightH.jpg)
     * 
     * @param thor The thorLayers string obtained from a playlist object
     * @returns An array of artwork urls
     */
    parseThor(thor: PandoraTypes.ThorLayers): PandoraTypes.ParsedThorLayers {
        let arr = thor.split('images/');
        arr = arr.filter(i => i.includes('@1'))
        arr = arr.map(i => `https://content-images.p-cdn.com/images/${i.split('@1')[0]}_500W_500H.jpg`);
        return arr;
    }
    /**
     * Fetch and cache a Pandora source (anything that can be played)
     * @returns The source object
     */
    async source() {
        const res = await this.rest('/api/v1/playback/source', {
            deviceProperties: this.deviceProperties(),
            clientFeatures: [],
            deviceUuid: this.uuid,
            forceActive: true,
            includeItem: true,
            onDemandArtistMessageToken: '',
            skipExplicitCheck: true,
            sourceId: (await this.getStations()).stations[0].pandoraId
        });
        console.error(res);
        if (!PandoraChecks.Rest.isSource(res)) throw this.apiError();
        //console.error(res);
        this.src = res;
        this.ogSrc = res.source;
        await this.audio(res.item.audioUrl, res.item.key);
        return res;
    }
    /**
     * Peek at the next song (caches data)
     * @returns Response
     */
    async peek() {
        const res = await this.rest('/api/v1/playback/peek', {
            deviceProperties: this.deviceProperties(),
            clientFeatures: [],
            deviceUuid: this.uuid,
            forceActive: true,
            includeItem: true,
            onDemandArtistMessageToken: '',
            skipExplicitCheck: true,
            sourceId: (await this.getStations()).stations[0].pandoraId
        });
        console.error(res);
        if (!PandoraChecks.Rest.isSource(res)) throw this.apiError();
        //console.error(res);
        this.src = res;
        await this.audio(res.item.audioUrl, res.item.key);
        return res;
    }
    /**
     * Skip the current song (caches data)
     * @returns Response
     */
    async skip() {
        const res = await this.rest('/api/v1/action/skip', {
            checkOnly: false,
            deviceProperties: this.deviceProperties(),
            clientFeatures: [],
            deviceUuid: this.uuid,
            forceActive: true,
            includeItem: true,
            onDemandArtistMessageToken: '',
            skipExplicitCheck: true,
            sourceId: (await this.getStations()).stations[0].pandoraId
        });
        console.error(res);
        if (!PandoraChecks.Rest.isSource(res)) throw this.apiError();
        //console.error(res);
        this.src = res;
        await this.audio(res.item.audioUrl, res.item.key);
        return res;
    }
    /**
     * Self-explanatory
     */
    async thumbUp() {
        if (!this.src || !this.ogSrc) return;
        if (this.ogSrc.type !== 'Station') return;
        await this.rest('/api/v1/action/thumbUp', {
            deviceProperties: this.deviceProperties(),
            deviceUuid: this.uuid,
            elapsedTime: this.time,
            index: this.src.item.index,
            pandoraId: this.src.item.pandoraId,
            sourceId: this.ogSrc.pandoraId,
            trackToken: this.src.item.trackToken
        });
    }
    /**
     * Self-explanatory
     */
    async removeThumb() {
        if (!this.src || !this.ogSrc) return;
        if (this.ogSrc.type !== 'Station') return;
        await this.rest('/api/v1/action/removeThumb', {
            deviceProperties: this.deviceProperties(),
            deviceUuid: this.uuid,
            elapsedTime: this.time,
            index: this.src.item.index,
            pandoraId: this.src.item.pandoraId,
            sourceId: this.ogSrc.pandoraId,
            trackToken: this.src.item.trackToken
        });
    }
    async getConcerts() { // TODO: finish this + typedefs
        if (!this.src) throw new Error('No source');
        let id = '';
        for (const an of Object.values(this.src.annotations)) {
            if (!PandoraChecks.isArtist(an)) continue;
            id = an.pandoraId;
        }
        if (!id) throw new Error('No artist');
        const res = await this.rest('/api/v1/mip/getArtistPageConcerts', {
            pandoraId: id
        });
        if (!PandoraChecks.Rest.isConcerts(res)) throw this.apiError();
        return res;
    }
    /**
     * Pull track annotation from cache
     * If cache or track is undefined, an error will be thrown (do not retry)
     * @returns Track annotation object (documented in ptypes.d.ts)
     */
    getTrackAnnotation(): Annotations.Track {
        if (!this.src) throw new Error('No source');
        let res;
        for (const an of Object.values(this.src.annotations)) {
            if (!PandoraChecks.isTrack(an)) continue;
            res = an;
            break;
        }
        if (!res) throw new Error('No track');
        return res;
    }
    /**
     * Pull dominantColor from cache
     * If cache, track or color is undefined, white (#ffffff) will be returned.
     * @returns Color in hex format, including the "#"
     */
    getColor(): string {
        const white = '#ffffff'
        if (!this.src) return white;
        let col: string | null = '';
        let an;
        try {
            an = this.getTrackAnnotation();
        } catch {
            return white;
        }
        col = an.icon.dominantColor;
        col = !col ? white : col.startsWith('#') ? col : '#' + col;
        const t = tc(col);
        return t.isValid() ? col : white;
    }
    deviceProperties() {
        const d = new Date();
        if (!this.auth) throw new Error('Auth undefined');
        return {
            app_version: this.auth.webClientVersion,
            artist_collaborations_enabled: true,
            backgrounded: 'false',
            browser: 'Firefox',
            browser_id: 'Firefox',
            browser_version: '117.0', // TODO: get version and stuff from playwright
            campaign_id: 0,
            client_timestamp: d.getTime(),
            date_recorded: d.getTime(),
            day: `${d.getFullYear()}-${('0' + d.getMonth()).slice(-2)}-${('0' + d.getDate()).slice(-2)}`,
            device_code: '1880',
            device_id: '1880',
            device_os: 'Linux',
            device_uuid: this.uuid,
            is_on_demand_user: 'true',
            listenerId: this.auth.listenerId,
            music_playing: 'false',
            page_view: 'collection',
            promo_code: '',
            site_version: this.auth.webClientVersion,
            tuner_let_flags: 'SF',
            vendor_id: 100
        }
    }
    playPause() {
        if (this.status.playing) this.mplay.pause();
        else this.mplay.play();
    }
    /**
     * Self-explanatory
     */
    async isPremium() {
        return (await this.infoV2()).activeProduct.productTier.toLowerCase().includes('premium');
    }
    async getAvailableProducts(): Promise<PandoraRest.Products> {
        const res = await this.rest('/api/v2/charon/getAvailableProducts');
        if (!PandoraChecks.Rest.isProducts(res)) throw this.apiError();
        return res;
    }
    async isUS() {
        return (await this.getAvailableProducts()).billingTerritory.toLowerCase() === 'us';
    }
    /**
     * Check plan compatibility
     */
    async checkCompat() {
        if (!await this.isUS()) {
            console.error('Pandora is only supported in the US');
            process.exit(0);
        }
        if (!await this.isPremium()) {
            console.error('Pandora Premium is the only product currently supported (free subscribers coming eventually) (maybe)');
            process.exit(0);
        }
    }
    /**
     * Retry an async function 10 times, with delays in between
     * @param func The function to retry (bind beforehand if needed)
     * @returns The function's return value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry(func: () => any) {
        return new Promise<Awaited<ReturnType<typeof func>>>(r => {
            let tries = 0;
            const int = setInterval(async () => {
                try {
                    const res = await func();
                    clearInterval(int);
                    r(res);
                } catch (err) {
                    console.error(err);
                    tries++;
                }
                if (tries >= 10) throw new Error('Could not connect to Pandora!');
            }, 3000);
        })
    }
}

export default Api;
