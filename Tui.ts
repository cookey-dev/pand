import bl from 'blessed';
import figlet from 'figlet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import strip from 'striptags';
import invert from 'invert-color';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { decode } from 'html-entities';
import tc from 'tinycolor2';
import ApiOpt from './ApiOpt.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Kitty from './Kitty.mjs';

interface Boxes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    splash: bl.Widgets.BoxElement;
    splashText: bl.Widgets.TextElement;
    bar?: bl.Widgets.BoxElement;
    dur?: bl.Widgets.BoxElement;
    barCol?: bl.Widgets.BoxElement;
    play?: bl.Widgets.ButtonElement;
}

class Tui extends ApiOpt {
    scr;
    boxes: Boxes;
    constructor() {
        super();
        this.mplay.on('status', this.update.bind(this));
        this.mplay.on('time', this.dur.bind(this));
        this.mplay.on('play', () => this.boxes.play?.setContent(this.icons.pause));
        this.mplay.on('start', () => this.boxes.play?.setContent(this.icons.pause));
        this.mplay.on('pause', () => this.boxes.play?.setContent(this.icons.play));

        this.scr = bl.screen({
            smartCSR: true,
            fullUnicode: true
        });
        this.scr.title = 'Pandora';
        this.scr.key(['escape', 'C-c'], () => {
            this.mplay.player?.instance?.kill();
            process.exit(0);
        });
        this.scr.key(['C-r'], () => this.scr.render());
        this.boxes = {
            splash: bl.box({
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                style: {
                    fg: 'white',
                    bg: 'blue'
                }
            }),
            splashText: bl.text({
                top: 'center',
                left: 'center',
                width: 'shrink',
                height: 'shrink',
                content: figlet.textSync('Pandora', {
                    font: 'ANSI Shadow',
                }),
                style: {
                    fg: 'black',
                    bg: 'blue'
                }
            })
        }
        this.boxes.splash.append(this.boxes.splashText);
        this.scr.append(this.boxes.splash);
        this.boxes.splash.focus();
        this.scr.render();
    }
    /**
     * Set the fg and bg for a list of boxes
     * @param boxes Box keys
     */
    fgBg(...boxes: Array<string>): void {
        const col = this.getColor();
        const bg = this.bgCol(col);
        for (const box of boxes) {
            if (this.boxes[box] && this.boxes[box].style.fg && this.boxes[box].style.bg) {
                this.boxes[box].style.bg = bg;
                this.boxes[box].style.fg = invert(col, true);
            }
        }
    }
    update() {
        this.fgBg('box', 'dur');
        this.boxes.bar?.setContent(this.getSong());
        this.scr.render();
    }
    prettySec(dur: number): string {
        const min = Math.floor(dur / 60);
        const sec = Math.floor(dur % 60);
        return `${min}:${('0' + sec).slice(-2)}`;
    }
    dur(sec: number) {
        const col = this.getColor();
        this.boxes.dur?.setContent(this.prettySec(sec));
        if (!this.metad || !this.metad.duration) return;
        const blks = Math.round(this.scr.cols / this.metad.duration * sec);
        if (!this.boxes.barCol) {
            this.boxes.barCol = bl.box({
                width: blks,
                height: 1,
                top: '100%-1',
                left: 0,
                style: {
                    fg: invert(col, true),
                    bg: col
                }
            });
            this.scr.append(this.boxes.barCol);
            this.boxes.dur?.setFront();
            this.boxes.play?.setFront();
        } else {
            this.boxes.barCol.width = blks;
            if (this.boxes.bar && this.boxes.bar.getContent().length >= blks) {
                this.boxes.barCol.setContent(bl.stripTags(this.boxes.bar.getContent()).substring(0, blks)
                    .replace(this.icons.explicit, `{red-fg}${this.icons.explicit}{/red-fg}`)
                    .replace(this.icons.clean, `{gray-fg}${this.icons.clean}{/gray-fg}`));
            }
            if (this.boxes.play && parseInt(this.boxes.play.aleft.toString()) + 1 === blks) this.boxes.play.style.bg = col;
            if (this.boxes.dur && parseInt(this.boxes.dur.aleft.toString()) >= blks) {
                const old = bl.stripTags(this.boxes.dur.getContent());
                const stIdx = parseInt(this.boxes.dur.aleft.toString());
                const txtIdx = blks - stIdx;
                this.boxes.dur.setContent(`{${col}-bg}${old.slice(0, txtIdx)}{/${col}-bg}${old.slice(txtIdx)}`);
            }
        }
        this.scr.render();
    }
    async source() {
        const src = super.source.bind(this);
        let res: Awaited<ReturnType<typeof src>>;
        try {
            res = await super.source();
        } catch (err) {
            console.error(err);
            try {
                res = await this.retry(super.source.bind(this));
            } catch (err) {
                console.error(err);
                console.log(err);
                process.exit(1);
            }
        }
        if (!res) throw new Error('Could not connect to Pandora!');
        return res;
    }
    bgCol(hex: string) {
        let col = tc(hex);
        col = col.isDark() ? col.lighten(10) : col.darken(10);
        return col.toHexString();
    }
    initBar() {
        const hex = this.getColor();
        const col = this.bgCol(hex);
        this.boxes.bar = bl.box({
            top: '100%-1',
            left: 'center',
            width: '100%',
            height: 1,
            content: 'Buffering',
            tags: true,
            style: {
                bg: col,
                fg: invert(col, true)
            }
        });
        this.boxes.dur = bl.box({
            top: '100%-1',
            left: '100%-9',
            width: 'shrink',
            height: 1,
            align: 'right',
            content: '',
            tags: true,
            style: {
                bg: col,
                fg: invert(col, true)
            }
        });
        this.boxes.play = bl.button({
            top: '100%-1',
            left: 'center',
            width: 1,
            height: 1,
            content: this.icons.play,
            style: {
                bg: col,
                fg: invert(col, true)
            }
        });
        this.boxes.play.on('click', this.playPause.bind(this));
        this.scr.append(this.boxes.bar);
        this.scr.append(this.boxes.dur);
        this.scr.append(this.boxes.play);
        this.boxes.bar.focus();
        this.scr.render();
    }
    async init() {
        await super.init();
        await this.source()
        this.boxes.splash?.destroy();
        this.scr.render();
        this.initBar();
    }
}

export default Tui;