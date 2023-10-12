import bl from 'blessed';
import { spawn } from 'node:child_process';
const { Box, Node } = bl;

function Kitty(opts) {
    if (!(this instanceof Node)) {
        return new Kitty(opts);
    }
    opts = opts || {};
    opts.cols = opts.cols || 50;
    opts.content = opts.content || '';
    this.options = opts;
    Box.call(this, opts);
}
Kitty.prototype = Object.create(Box.prototype);
Kitty.prototype.setImage = function(img) {
    this.options.image = img;
}
Kitty.prototype.render = function() {
    if (this.options.file) {
        spawn('kitty', [
            '+kitten', 'icat',
            '--place', `${this.width}x${this.height}@${this.aleft}x${this.atop}`,
            this.options.file
        ], {
            stdio: 'inherit'
        });
    }
    return this._render();
}
Kitty.prototype.type = 'kitty';

export default Kitty;
