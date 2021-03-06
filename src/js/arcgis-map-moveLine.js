import tool from '../utils/tool';
import {
    requestAnimationFrame,
    cancelAnimationFrame
} from '../animation/requestAnimationFrame';


var MoveLine = function (map, userOptions) {
    var self = this;
    self.map = map;
    self.lines = [];
    self.pixelList = [];

    //默认参数
    var options = {
        //线条宽度
        lineWidth: 1,
        //线条颜色
        lineStyle: '#ba92f1'
    };

    self.init(userOptions, options);

    //全局变量
    var baseCtx = self.baseCtx = self.options.canvas.getContext("2d");
    var animateCtx = self.animateCtx = self.options.animateCanvas.getContext("2d");
    baseCtx.lineWidth = options.lineWidth;
}

MoveLine.prototype.init = function (setting, defaults) {
    //合并参数
    tool.merge(setting, defaults);
    this.options = defaults;
}

MoveLine.prototype.render = function () {
    var self = this;
    var baseCtx = self.baseCtx;
    if (!baseCtx) {
        return;
    }

    self._addLine();

    self.pixelList = [];
    self.lines.forEach(function (line) {
        self.pixelList.push({
            data: line.getPointList(self.map)
        })
        line.drawPath(baseCtx, self.map, self.options);
    });
}
MoveLine.prototype.animate = function () {
    var self = this;
    var animateCtx = self.animateCtx;
    if (!animateCtx) {
        return;
    }

    self._addLine();

    // baseCtx.clearRect(0, 0, self.map.width, self.map.height);
    animateCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
    var prev = animateCtx.globalCompositeOperation;
    animateCtx.globalCompositeOperation = "destination-in";
    animateCtx.fillRect(0, 0, self.map.width, self.map.height);
    animateCtx.globalCompositeOperation = prev;

    self.pixelList = [];
    self.lines.forEach(function (line) {
        self.pixelList.push({
            data: line.getPointList(self.map)
        })
        line.draw(animateCtx, self.map, self.options);
    });
}

MoveLine.prototype.start = function () {
    var self = this;
    self.stop();
    self.render();
    (function drawFrame() {
        self.timer = setTimeout(function () {
            requestAnimationFrame(drawFrame);
            self.animate();
        }, 1000 / 20);
    })();
}

MoveLine.prototype.stop = function () {
    if (this.timer) {
        clearTimeout(this.timer);
    }
}

MoveLine.prototype._addLine = function () {
    var self = this;
    if (self.lines && self.lines.length > 0) {
        return;
    }
    var opts = self.options;
    var dataset = opts.data;
    dataset.forEach(function (l, i) {
        var line = new Line({
            path: []
        });
        l.forEach(function (p, j) {
            line.path.push({
                location: p
            });
        });
        self.lines.push(line);
    });
}

function Line(opts) {
    this.path = opts.path;
    this.age = 0;
    this.maxAge = 0;
}

Line.prototype.getPointList = function (map) {
    var points = [],
        path = this.path;
    if (path && path.length > 0) {
        path.forEach(function (p) {
            points.push({
                pixel: map.toScreen(p.location)
            });
        })
        this.maxAge = points.length;
    }
    return points;
}

Line.prototype.drawPath = function (context, map, options) {
    var pointList = this.pixelList || this.getPointList(map);
    context.save();
    context.beginPath();
    context.lineWidth = options.lineWidth;
    context.strokeStyle = options.lineStyle;
    context.moveTo(pointList[0].pixel.x, pointList[0].pixel.y);
    for (var i = 0, len = pointList.length; i < len; i++) {
        context.lineTo(pointList[i].pixel.x, pointList[i].pixel.y);
    }
    context.stroke();
    context.closePath();
    context.restore();
}

Line.prototype.draw = function (context, map, options) {
    var pointList = this.pixelList || this.getPointList(map);
    context.beginPath();
    // context.shadowColor = '#eda513';
    // context.shadowBlur = 2;
    context.lineWidth = options.lineWidth;
    context.strokeStyle = 'yellow';
    if (this.age >= this.maxAge - 1) {
        this.age = 0;
    }
    context.moveTo(pointList[this.age].pixel.x, pointList[this.age].pixel.y);
    context.lineTo(pointList[this.age + 1].pixel.x, pointList[this.age + 1].pixel.y);
    context.stroke();

    this.age++;
}

Line.prototype.drawCicle = function (context, map, options) {
    var pointList = this.pixelList || this.getPointList(map);
    context.save();

}

export default MoveLine;