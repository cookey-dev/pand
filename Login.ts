import ch from 'chalk';
import { join as desm } from 'desm';
import { BrowserContext, Page, Response } from 'playwright';
import { chromium as pptr } from 'playwright-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';

pptr.use(Stealth());

class Login {
    browse: BrowserContext | null;
    auth: Auth | null;
    token: PandoraTypes.AuthToken;
    page: Page | null;
    udd: string;
    constructor() {
        this.browse = null;
        this.auth = null;
        this.token = '';
        this.page = null;
        this.udd = desm(import.meta.url, 'data')
    }
    async login() {
        console.error('Opening browser');
        this.browse = await pptr.launchPersistentContext(this.udd, {
            headless: false,
            args: ['--mute-audio', '--no-sandbox', '--app=https://pandora.com/account/sign-in']
        });
        this.page = this.browse.pages()[0];
        //await this.page.goto('https://pandora.com/account/sign-in');
        const _res: Response = await this.page.waitForResponse(res => new URL(res.url()).pathname === '/api/v1/auth/login' && res.status() === 200);
        const res: Auth = await _res.json();
        if (res.fullName) {
            this.auth = res;
            this.token = this.auth.authToken;
            console.error(`Hello, ${ch.cyan(res.fullName)}`);
        }
        //await this.page.waitForSelector('.Avatar', { timeout: 0 });
        setTimeout(async () => this.browse && await this.browse.close(), 5000);
    }
    async init() {
        await this.login();
        console.error(this.auth)
    }
}

export default Login;