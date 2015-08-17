(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var attach, calculatePositions, draw, i, idx, item, j, len, mkRandomDimensions, ref, rgbToHex, state;

calculatePositions = require('../../radial-plotter').calculatePositions;

rgbToHex = function(r, g, b) {
  var formatHex;
  formatHex = function(n) {
    return ('00' + Math.floor(n).toString(16)).substr(-2);
  };
  return '#' + ("" + (formatHex(r)) + (formatHex(g)) + (formatHex(b)));
};

mkRandomDimensions = function() {
  var hmax, hmin, wmax, wmin;
  wmax = 10;
  wmin = 10;
  hmin = 10;
  hmax = 10;
  return {
    width: Math.random() * (wmax - wmin) + wmin,
    height: Math.random() * (hmax - hmin) + hmin
  };
};

state = {
  items: (function() {
    var j, results;
    results = [];
    for (i = j = 0; j <= 10; i = ++j) {
      results.push(mkRandomDimensions());
    }
    return results;
  })(),
  radius: 50,
  bounds: {
    left: 0,
    right: 500,
    top: 0,
    bottom: 500
  },
  isHeadedLeft: true
};

ref = state.items;
for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
  item = ref[idx];
  item.color = rgbToHex(idx * (255 / state.items.length), idx * (127 / state.items.length), idx * (64 / state.items.length));
}

draw = function(canvas) {
  var context, sideLength;
  window.requestAnimationFrame(function() {
    return draw(canvas);
  });
  context = canvas.getContext('2d');
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#555';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (state.mousePosition != null) {
    context.fillStyle = 'black';
    sideLength = 10;
    context.fillRect(state.mousePosition.x - (sideLength / 2), state.mousePosition.y - (sideLength / 2), sideLength, sideLength);
  }
  if (state.positions != null) {
    state.positions.map(function(arg, idx) {
      var position, rect;
      position = arg.position, rect = arg.rect;
      context.fillStyle = state.items[idx].color;
      return context.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
    });
  }
  return context.restore();
};

attach = function(canvas) {
  var context;
  window.requestAnimationFrame(function() {
    return draw(canvas);
  });
  context = canvas.getContext('2d');
  return canvas.addEventListener('mousemove', function(evt) {
    var isHeadedLeft, items, ref1;
    state.mousePosition = {
      x: evt.offsetX,
      y: evt.offsetY
    };
    ref1 = calculatePositions(state.mousePosition, 50, state.items, state.bounds, state.isHeadedLeft), items = ref1.items, isHeadedLeft = ref1.isHeadedLeft;
    state.positions = items;
    return state.isHeadedLeft = isHeadedLeft;
  });
};

attach(document.getElementById('canvas'));



},{"../../radial-plotter":2}],2:[function(require,module,exports){
var calculatePositions2, checkContainment, checkIntersect, polToCar;

polToCar = function(angle, radius, center) {
  if (center == null) {
    center = {
      x: 0,
      y: 0
    };
  }
  return {
    x: radius * (Math.cos(angle)) + center.x,
    y: radius * (Math.sin(angle)) + center.y
  };
};

checkContainment = function(subRect, inRect) {
  return (subRect.left >= inRect.left) && (subRect.top >= inRect.top) && (subRect.right <= inRect.right) && (subRect.bottom <= inRect.bottom);
};

checkIntersect = function(r1, r2, margin) {
  if (margin == null) {
    margin = 0;
  }
  return !((r2.left - margin) > r1.right || (r2.right + margin) < r1.left || (r2.top - margin) > r1.bottom || (r2.bottom + margin) < r1.top);
};

calculatePositions2 = function(center, radius, items, bounds, isHeadedLeft) {
  var collidesWithPrevious, farthestPt, maxDimension, mkRect;
  mkRect = function(pt, dim) {
    return {
      left: pt.x - (dim.width / 2),
      right: pt.x + (dim.width / 2),
      top: pt.y - (dim.height / 2),
      bottom: pt.y + (dim.height / 2)
    };
  };
  collidesWithPrevious = function(rect, previous) {
    return previous.filter(function(elm) {
      return checkIntersect(rect, elm.rect, 10);
    }).length > 0;
  };
  maxDimension = items.reduce(function(prev, current) {
    if (current.width > prev.width) {
      prev.width = current.width;
    }
    if (current.height > prev.height) {
      prev.height = current.height;
    }
    return prev;
  });
  farthestPt = {
    x: (isHeadedLeft ? -1 : 1) * (radius + maxDimension.width) + center.x,
    y: center.y
  };
  if (!checkContainment(mkRect(farthestPt, {
    width: 1,
    height: 1
  }), bounds)) {
    isHeadedLeft = !isHeadedLeft;
  }
  return {
    isHeadedLeft: isHeadedLeft,
    items: items.map(function(dim, idx) {
      var angle, angleDivision, angleOffset, angleSpan, attempt, pos, r, rect;
      angleSpan = Math.PI;
      angleDivision = angleSpan / items.length;
      angleOffset = (isHeadedLeft ? Math.PI : 0) - (angleSpan / 2) + (angleDivision / 2);
      angle = idx * angleDivision + angleOffset;
      angle = angle * (isHeadedLeft ? 1 : -1);
      r = radius;
      pos = polToCar(angle, r, center);
      rect = mkRect(pos, dim);
      attempt = 0;
      while ((!checkContainment(rect, bounds)) && (attempt < 100)) {
        attempt++;
        angle = isHeadedLeft ? 2 * Math.PI - (idx * (angleSpan / (items.length - 1)) + angleOffset) : idx * (angleSpan / (items.length - 1)) + angleOffset;
        r = radius * (attempt + 1);
        pos = polToCar(angle, r, center);
        rect = mkRect(pos, dim);
      }
      if (attempt > 50) {
        console.log('high loop');
      }
      return {
        position: pos,
        rect: rect
      };
    })
  };
};

module.exports = {
  calculatePositions: calculatePositions2
};



},{}]},{},[1]);
