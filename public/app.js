(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CAMERA_HEIGHT, CAMERA_WIDTH, CELL_SIZE, Camera, cj, createCircle, createDummyDungeon, getPosition, getRealPosition;

createDummyDungeon = function() {
  return [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 1, 1, 0, 0, 1], [1, 0, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1]];
};

CELL_SIZE = 100;

CAMERA_WIDTH = 500;

CAMERA_HEIGHT = 500;

cj = createjs;

createCircle = function(_arg) {
  var circle, color, onClick, size, _ref;
  _ref = _arg != null ? _arg : {}, size = _ref.size, color = _ref.color, onClick = _ref.onClick;
  if (size == null) {
    size = 10;
  }
  if (color == null) {
    color = 'black';
  }
  circle = new cj.Shape();
  circle.graphics.beginFill(color).drawCircle(0, 0, size);
  circle.addEventListener('click', function() {
    console.log('clicked');
    return typeof onClick === "function" ? onClick() : void 0;
  });
  return circle;
};

getPosition = function(x, y) {
  return {
    x: x * CELL_SIZE,
    y: y * CELL_SIZE
  };
};

Camera = (function() {
  function Camera(stage) {
    this.stage = stage;
  }

  Camera.prototype.moveTo = function(_arg) {
    var pos, x, y;
    x = _arg.x, y = _arg.y;
    pos = this.getRealPosition({
      x: x,
      y: y
    });
    console.log(pos.rx, pos.ry);
    this.stage.regX = +pos.rx - CAMERA_WIDTH / 2;
    this.stage.regY = +pos.ry - CAMERA_HEIGHT / 2;
    return this.stage.update();
  };

  Camera.prototype.moveWithAnimation = function(_arg) {
    var dx, dy, pos, x, y;
    x = _arg.x, y = _arg.y;
    pos = this.getRealPosition({
      x: x,
      y: y
    });
    dx = +pos.rx - CAMERA_WIDTH / 2;
    dy = +pos.ry - CAMERA_HEIGHT / 2;
    return cj.Tween.get(stage).to({
      regX: dx,
      regY: dy
    }, 300).call(function() {
      return console.log('done');
    });
  };

  Camera.prototype.getRealPosition = function(_arg) {
    var x, y;
    x = _arg.x, y = _arg.y;
    return {
      rx: x * CELL_SIZE,
      ry: y * CELL_SIZE
    };
  };

  return Camera;

})();

getRealPosition = function(_arg) {
  var x, y;
  x = _arg.x, y = _arg.y;
  return {
    rx: x * CELL_SIZE,
    ry: y * CELL_SIZE
  };
};

$((function(_this) {
  return function() {
    var camera, canvas, circle, down, edge, isLock, map, onDrag, pathFinder, regX, regY, right, row, stage, startPoint, wall, x, y, _i, _j, _len, _len1, _ref, _ref1;
    cj.Ticker.setFPS(20);
    cj.Ticker.on('tick', function() {
      return stage.update();
    });
    map = createDummyDungeon();
    canvas = document.getElementById("canvas");
    stage = new cj.Stage(canvas);
    window.stage = stage;
    pathFinder = new PathFinder;
    onDrag = false;
    isLock = false;
    _ref = [], regX = _ref[0], regY = _ref[1];
    new Hammer(canvas).on('dragstart', function(ev) {
      onDrag = true;
      regX = stage.regX;
      return regY = stage.regY;
    }).on('drag', function(ev) {
      stage.regX = regX - ev.gesture.deltaX;
      stage.regY = regY - ev.gesture.deltaY;
      stage.update();
      return console.log('drag', ev.gesture.deltaX, ev.gesture.deltaY);
    }).on('dragend', function(ev) {
      onDrag = false;
      return console.log('dragend', ev.gesture);
    });
    camera = new Camera(stage);
    startPoint = [3, 3];
    camera.moveTo({
      x: 3,
      y: 3
    });
    for (x = _i = 0, _len = map.length; _i < _len; x = ++_i) {
      row = map[x];
      for (y = _j = 0, _len1 = row.length; _j < _len1; y = ++_j) {
        wall = row[y];
        if (wall === 0) {
          circle = (function(x, y) {
            circle = createCircle({
              color: 'black',
              onClick: function() {
                var done, paths, px, py, step, tween, _k, _len2, _ref1;
                paths = pathFinder.searchPath(map, startPoint, [x, y]);
                if (paths) {
                  for (step = _k = 0, _len2 = paths.length; _k < _len2; step = ++_k) {
                    _ref1 = paths[step], px = _ref1[0], py = _ref1[1];
                    console.log('step', step, ':', px, py);
                  }
                }
                done = function() {
                  startPoint = [x, y];
                  return console.log('done');
                };
                if (paths) {
                  paths.shift();
                  tween = _.reduce(paths, function(t, _arg) {
                    var px, py, rx, ry, _ref2;
                    px = _arg[0], py = _arg[1];
                    _ref2 = getRealPosition({
                      x: px,
                      y: py
                    }), rx = _ref2.rx, ry = _ref2.ry;
                    return t.to({
                      regX: rx - CAMERA_WIDTH / 2,
                      regY: ry - CAMERA_HEIGHT / 2
                    }, 300);
                  }, cj.Tween.get(stage));
                  return tween.call(done);
                } else {
                  return camera.moveWithAnimation({
                    x: x,
                    y: y
                  }).call(done);
                }
              }
            });
            circle.x = x * CELL_SIZE;
            circle.y = y * CELL_SIZE;
            return circle;
          })(x, y);
          stage.addChild(circle);
        }
        if (!wall) {
          right = (_ref1 = map[x + 1]) != null ? _ref1[y] : void 0;
          down = map[x][y + 1];
          if (right === 0) {
            edge = createCircle({
              size: 5,
              color: 'grey'
            });
            edge.x = x * CELL_SIZE + CELL_SIZE / 2;
            edge.y = y * CELL_SIZE;
            stage.addChild(edge);
          }
          if (down === 0) {
            edge = createCircle({
              size: 5,
              color: 'grey'
            });
            edge.x = x * CELL_SIZE;
            edge.y = y * CELL_SIZE + CELL_SIZE / 2;
            stage.addChild(edge);
          }
        }
      }
    }
    return stage.update();
  };
})(this));


},{}]},{},[1])