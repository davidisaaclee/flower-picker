(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
