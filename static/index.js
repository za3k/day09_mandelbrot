/* Color */

function hex(x) { // one-byte only
    const digits="0123456789ABCDEF";
    x = Math.floor(x)
    return digits[Math.floor(x/16)]+digits[x%16];
}
// Source: https://gist.github.com/mjackson/5311256
function hsvToRgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return `#${hex(r*255)}${hex(g*255)}${hex(b*255)}`;
}
let hue = {};
for (let h=0; h<255; h++) hue[h] = hsvToRgb(h/255, 1, 1);

/* Mandelbrot */

function mandelbrot(x, y, maxIter) {
    let z_real = 0, z_imag = 0;
    for (let n=0; n<maxIter; n++) {
        let rr = z_real*z_real;
        let ri = z_real*z_imag;
        let ii = z_imag*z_imag;

        if (rr+ii > 4) return n; // abs(z) < 2

        // z = z*z + c
        const real = rr - ii + x;
        const imag = 2*ri + y;
        z_real = real;
        z_imag = imag;
    }
    return maxIter;
}

function draw(canvas, params) {
    const {minX, maxX, minY, maxY, xSteps, ySteps, maxIter} = params;
    const xSize = (maxX-minX)/xSteps;
    const ySize = (maxY-minY)/ySteps;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const xScale = Math.floor(canvas.width / xSteps);
    const yScale = Math.floor(canvas.height / ySteps);
    for (let xStep = 0; xStep < xSteps; xStep++) {
        for (let yStep = 0; yStep < ySteps; yStep++) {
            const x = minX+xStep*xSize;
            const y = minY+yStep*ySize;
            const iter = mandelbrot(x, y, maxIter);
            if (iter >= maxIter) {
                // draw black
                context.fillStyle = "#000000";
            } else {
                // draw white
                const color = hue[Math.floor(iter / maxIter * 255)];
                context.fillStyle = color;
            }
            context.fillRect(xStep*xScale, yStep*yScale, (xStep+1)*xScale, (yStep+1)*yScale);
        }
    }
}

/* Zooming */

function zoom(params, click) {
    const ZOOM = 2.0;
    let {minX, maxX, minY, maxY, xSteps, ySteps, maxIter} = params;
    const {clickX, clickY} = click;

    const xWidth = maxX-minX;
    const yWidth = maxY-minY;
    const centerX = minX + xWidth*clickX;
    const centerY = minY + yWidth*clickY;
    minX = centerX - xWidth/ZOOM/2;
    maxX = centerX + xWidth/ZOOM/2;
    minY = centerY - yWidth/ZOOM/2;
    maxY = centerY + yWidth/ZOOM/2;

    return {minX, maxX, minY, maxY, xSteps, ySteps, maxIter};
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    return {
        clickX: (event.clientX - rect.left)/canvas.width,
        clickY: (event.clientY - rect.top)/canvas.height,
    }
}

/* URLs and HTML */

function urlDict() {
    const r = {};
    const urlParams = new URLSearchParams(window.location.search||"?");
    for (const [k,v] of urlParams) r[k]=Number(v);
    return r;
}

$(document).ready(() => {
    const canvas = document.getElementById("canvas");
    const defaultParams = {minX: -1.5, maxX: 0.5, minY: -1, maxY: 1, xSteps: canvas.width, ySteps: canvas.height, maxIter: 100}; 
    let params = {...defaultParams, ...urlDict()};
    draw(canvas, params);
    $(canvas).on("click", (event) => {
        const click = getCursorPosition(canvas, event);
        params = zoom(params, click);
        history.pushState(params, "", "?"+jQuery.param(params));
        draw(canvas, params);
    });

    addEventListener('popstate', (event) => {
        params = {...defaultParams, ...event.state};
        draw(canvas, params);
    });
});
