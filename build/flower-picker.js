(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TWO_PI, centerToOffset, checkContainment, elementCenterPosition, polToCar, rectFromOffset, toCssFigure;

polToCar = function(angle, radius) {
  return {
    x: radius * (Math.cos(angle)),
    y: radius * (Math.sin(angle))
  };
};

centerToOffset = function(arg, element) {
  var rect, x, y;
  x = arg.x, y = arg.y;
  rect = element.getBoundingClientRect();
  return {
    top: y - (rect.height / 2),
    left: x - (rect.width / 2)
  };
};

elementCenterPosition = function(element, relativeTo) {
  var elmBounds, relBounds;
  elmBounds = element.getBoundingClientRect();
  relBounds = relativeTo.getBoundingClientRect();
  return {
    x: elmBounds.left - relBounds.left + (elmBounds.width / 2),
    y: elmBounds.top - relBounds.top + (elmBounds.height / 2)
  };
};

checkContainment = function(subRect, inRect) {
  return (subRect.left >= inRect.left) && (subRect.top >= inRect.top) && (subRect.right <= inRect.right) && (subRect.bottom <= inRect.bottom);
};

rectFromOffset = function(baseRect, arg) {
  var result, x, y;
  x = arg.x, y = arg.y;
  result = {
    left: x + baseRect.left,
    top: y + baseRect.top,
    width: baseRect.width,
    height: baseRect.height
  };
  result['right'] = result.left + result.width;
  result['bottom'] = result.top + result.height;
  return result;
};

TWO_PI = Math.PI * 2;

toCssFigure = function(num) {
  return num.toPrecision(8);
};

Polymer({
  is: 'flower-picker',
  properties: {
    petals: {
      type: Array
    },
    radius: {
      type: Number,
      value: 80
    }
  },
  start: function(origin) {
    this._isActive = true;
    return this._spawnFlower(origin, this.petals);
  },
  finish: function(arg) {
    var x, y;
    x = arg.x, y = arg.y;
    if ((this._overPetal != null) && this._overPetal.isLeaf) {
      this.fire('selected', {
        petal: this._overPetal,
        value: (function(_this) {
          return function() {
            if (_this._overPetal.value != null) {
              return _this._overPetal.value(_this._overPetal.model);
            } else {
              return _this._overPetal.model;
            }
          };
        })(this)()
      });
    }
    this._flowers.forEach(function(flower) {
      return Polymer.dom(Polymer.dom(flower.element).parentNode).removeChild(flower.element);
    });
    this._flowers = [];
    this._overPetal = null;
    return this._isActive = false;
  },
  _flowers: [],
  _overPetal: null,
  _isActive: false,
  _container: function() {
    return this.$['picker-container'];
  },
  _createPetalElement: function(model, flowerIndex) {
    var petal;
    petal = document.createElement('div');
    if (model.isBackPetal == null) {
      Polymer.dom(petal).classList.add('petal');
      Polymer.dom(petal).classList.add('unselectable');
      petal.addEventListener('trackover', (function(_this) {
        return function(detail) {
          return _this._hoverPetal(petal, model, flowerIndex);
        };
      })(this));
      petal.addEventListener('down', (function(_this) {
        return function(detail) {
          return _this._hoverPetal(petal, model, flowerIndex);
        };
      })(this));
      petal.addEventListener('trackout', (function(_this) {
        return function(detail) {
          return _this._unhoverPetal(petal);
        };
      })(this));
      Polymer.dom(petal).innerHTML = model.display != null ? model.display(model.model) : model.model;
      if (model.isLeaf) {
        Polymer.dom(petal).classList.add('leaf');
      } else {
        Polymer.dom(petal).classList.add('branch');
      }
    } else {

    }
    return petal;
  },
  _spawnFlower: function(origin, petals, backPetalPoint) {
    var angleOffset, flower, offsetFlower, offsetPistil, petalElements, pistil, spawningFlowerIndex;
    spawningFlowerIndex = this._flowers.length;
    flower = document.createElement('div');
    flower.id = "flower" + spawningFlowerIndex;
    Polymer.dom(flower).classList.add('flower');
    Polymer.dom(this.$['picker-container']).appendChild(flower);
    pistil = document.createElement('div');
    pistil.id = "pistil" + spawningFlowerIndex;
    Polymer.dom(pistil).classList.add('pistil');
    Polymer.dom(pistil).classList.add('pistil');
    Polymer.dom(flower).appendChild(pistil);
    offsetFlower = (function() {
      var left, ref, top;
      ref = centerToOffset(origin, flower), top = ref.top, left = ref.left;
      return {
        left: toCssFigure(left),
        top: toCssFigure(top)
      };
    })();
    this.transform("translate(" + offsetFlower.left + "px, " + offsetFlower.top + "px)", flower);
    offsetPistil = (function() {
      var flowerCenter, left, ref, top;
      flowerCenter = elementCenterPosition(flower, flower);
      ref = centerToOffset(flowerCenter, pistil), top = ref.top, left = ref.left;
      return {
        left: toCssFigure(left),
        top: toCssFigure(top)
      };
    })();
    this.transform("translate(" + offsetPistil.left + "px, " + offsetPistil.top + "px)", pistil);
    pistil.addEventListener('trackover', (function(_this) {
      return function(evt) {
        return _this._hoverPistil(spawningFlowerIndex);
      };
    })(this));
    if (this._flowers.length !== 0) {
      this._deactivateFlower(this._flowers[this._flowers.length - 1]);
    }
    angleOffset = (Math.PI / (2 * petals.length)) + Math.PI;
    petalElements = petals.map((function(_this) {
      return function(elm, idx) {
        var center, currentBounds, offsetPetal, petal, potentialRect;
        petal = _this._createPetalElement(elm, spawningFlowerIndex);
        Polymer.dom(flower).appendChild(petal);
        center = polToCar(Math.PI * idx / petals.length + angleOffset, _this.radius);
        offsetPetal = centerToOffset(center, petal);
        potentialRect = rectFromOffset(petal.getBoundingClientRect(), {
          x: offsetPetal.left,
          y: offsetPetal.top
        });
        currentBounds = _this._container().getBoundingClientRect();
        if (!(checkContainment(potentialRect, currentBounds))) {
          console.log('not contained: ', petal, currentBounds);
        }
        _this.transform("translate(" + (toCssFigure(offsetPetal.left)) + "px, " + (toCssFigure(offsetPetal.top)) + "px)", petal);
        return petal;
      };
    })(this));
    return this._flowers.push({
      element: flower,
      origin: origin
    });
  },
  _deactivateFlower: function(flower) {
    return Polymer.dom(flower.element).childNodes.forEach(function(node) {
      if (node.classList.contains('petal')) {
        return Polymer.dom(node).classList.add('inactive-petal');
      } else if (node.classList.contains('flower')) {
        return Polymer.dom(node).classList.add('inactive-flower');
      }
    });
  },
  _activateFlower: function(flower) {
    return Polymer.dom(flower.element).childNodes.forEach(function(node) {
      if (node.classList.contains('petal')) {
        Polymer.dom(node).classList.remove('inactive-petal');
        if (node.classList.contains('over-branch')) {
          return Polymer.dom(node).classList.remove('over-branch');
        }
      } else if (node.classList.contains('flower')) {
        return Polymer.dom(node).classList.remove('inactive-flower');
      }
    });
  },
  _popFlower: function() {
    var flower, flowerParent;
    if (this._flowers.length > 0) {
      flower = this._flowers[this._flowers.length - 1];
      flowerParent = Polymer.dom(flower.element).parentNode;
      Polymer.dom(flowerParent).removeChild(flower.element);
      this._flowers.splice(this._flowers.length - 1, 1);
      if (this._flowers.length !== 0) {
        return this._activateFlower(this._flowers[this._flowers.length - 1]);
      }
    }
  },
  _createLinkElementFrom: function(fromFlowerIndex) {
    var angle, dst, linkElm, src;
    if ((this._flowers.length - 1) > (fromFlowerIndex + 1)) {
      console.log('Not enough flowers to make that link!');
    }
    src = this._flowers[fromFlowerIndex];
    dst = this._flowers[fromFlowerIndex + 1];
    angle = -Math.acos((dst.origin.x - src.origin.x) / this.radius);
    linkElm = document.createElement('div');
    Polymer.dom(this._container()).appendChild(linkElm);
    Polymer.dom(linkElm).classList.add('pistil-link');
    linkElm.style['position'] = 'absolute';
    linkElm.style['width'] = this.radius + "px";
    linkElm.style['height'] = '5px';
    linkElm.style['transform'] = "rotate(" + angle + "rad)";
    linkElm.style['background-color'] = '#faa';
    linkElm.style['left'] = src.origin.x + 'px';
    linkElm.style['top'] = src.origin.y + 'px';
    return linkElm.style['transform-origin'] = 'center left';
  },
  _hoverPetal: function(petalElement, petalModel, flowerIndex) {
    var currFlowerElm, elementCenter;
    if (this._overPetal === petalModel) {

    } else if (flowerIndex === (this._flowers.length - 1)) {
      petalElement.classList.add('over-petal');
      this._overPetal = petalModel;
      elementCenter = (function(_this) {
        return function() {
          var fieldRect, petalRect;
          petalRect = petalElement.getBoundingClientRect();
          fieldRect = _this._container().getBoundingClientRect();
          return {
            x: petalRect.left - fieldRect.left + (petalRect.width / 2),
            y: petalRect.top - fieldRect.top + (petalRect.height / 2)
          };
        };
      })(this)();
      if (!this._overPetal.isLeaf) {
        Polymer.dom(petalElement).classList.add('over-branch');
        currFlowerElm = this._flowers[this._flowers.length - 1].element;
        return this._spawnFlower(elementCenter, this._overPetal.children, elementCenterPosition(currFlowerElm, this._container()));
      }
    }
  },
  _unhoverPetal: function(petalElement) {
    petalElement.classList.remove('over-petal');
    return this._overPetal = null;
  },
  _hoverPistil: function(depth) {
    var i, j, ref, ref1, results;
    if (depth >= this._flowers.length) {
      return console.log("hovering over pistil of depth " + depth + ", but the flower stack is only " + this._flowers.length + " deep.");
    } else if (depth !== this._flowers.length) {
      results = [];
      for (i = j = ref = this._flowers.length - 1, ref1 = depth + 1; j >= ref1; i = j += -1) {
        results.push(this._popFlower());
      }
      return results;
    }
  },
  _handleUp: function(arg) {
    var detail, fieldRect;
    detail = arg.detail;
    fieldRect = this._container().getBoundingClientRect();
    return this.finish({
      x: detail.x - fieldRect.left,
      y: detail.y - fieldRect.top
    });
  },
  _lastHover: null,
  _handleTrack: function(evt, detail) {
    var hover;
    if (typeof evt.stopPropagation === "function") {
      evt.stopPropagation();
    }
    if (typeof evt.preventDefault === "function") {
      evt.preventDefault();
    }
    hover = detail.hover();
    this.fire('trackover', detail, {
      node: hover
    });
    if (hover !== this._lastHover) {
      this.fire('trackout', detail, {
        node: this._lastHover
      });
      return this._lastHover = hover;
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ndWxwLWNvZmZlZWlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZmxvd2VyLXBpY2tlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVFdPX1BJLCBjZW50ZXJUb09mZnNldCwgY2hlY2tDb250YWlubWVudCwgZWxlbWVudENlbnRlclBvc2l0aW9uLCBwb2xUb0NhciwgcmVjdEZyb21PZmZzZXQsIHRvQ3NzRmlndXJlO1xuXG5wb2xUb0NhciA9IGZ1bmN0aW9uKGFuZ2xlLCByYWRpdXMpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiByYWRpdXMgKiAoTWF0aC5jb3MoYW5nbGUpKSxcbiAgICB5OiByYWRpdXMgKiAoTWF0aC5zaW4oYW5nbGUpKVxuICB9O1xufTtcblxuY2VudGVyVG9PZmZzZXQgPSBmdW5jdGlvbihhcmcsIGVsZW1lbnQpIHtcbiAgdmFyIHJlY3QsIHgsIHk7XG4gIHggPSBhcmcueCwgeSA9IGFyZy55O1xuICByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IHkgLSAocmVjdC5oZWlnaHQgLyAyKSxcbiAgICBsZWZ0OiB4IC0gKHJlY3Qud2lkdGggLyAyKVxuICB9O1xufTtcblxuZWxlbWVudENlbnRlclBvc2l0aW9uID0gZnVuY3Rpb24oZWxlbWVudCwgcmVsYXRpdmVUbykge1xuICB2YXIgZWxtQm91bmRzLCByZWxCb3VuZHM7XG4gIGVsbUJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJlbEJvdW5kcyA9IHJlbGF0aXZlVG8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgeDogZWxtQm91bmRzLmxlZnQgLSByZWxCb3VuZHMubGVmdCArIChlbG1Cb3VuZHMud2lkdGggLyAyKSxcbiAgICB5OiBlbG1Cb3VuZHMudG9wIC0gcmVsQm91bmRzLnRvcCArIChlbG1Cb3VuZHMuaGVpZ2h0IC8gMilcbiAgfTtcbn07XG5cbmNoZWNrQ29udGFpbm1lbnQgPSBmdW5jdGlvbihzdWJSZWN0LCBpblJlY3QpIHtcbiAgcmV0dXJuIChzdWJSZWN0LmxlZnQgPj0gaW5SZWN0LmxlZnQpICYmIChzdWJSZWN0LnRvcCA+PSBpblJlY3QudG9wKSAmJiAoc3ViUmVjdC5yaWdodCA8PSBpblJlY3QucmlnaHQpICYmIChzdWJSZWN0LmJvdHRvbSA8PSBpblJlY3QuYm90dG9tKTtcbn07XG5cbnJlY3RGcm9tT2Zmc2V0ID0gZnVuY3Rpb24oYmFzZVJlY3QsIGFyZykge1xuICB2YXIgcmVzdWx0LCB4LCB5O1xuICB4ID0gYXJnLngsIHkgPSBhcmcueTtcbiAgcmVzdWx0ID0ge1xuICAgIGxlZnQ6IHggKyBiYXNlUmVjdC5sZWZ0LFxuICAgIHRvcDogeSArIGJhc2VSZWN0LnRvcCxcbiAgICB3aWR0aDogYmFzZVJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiBiYXNlUmVjdC5oZWlnaHRcbiAgfTtcbiAgcmVzdWx0WydyaWdodCddID0gcmVzdWx0LmxlZnQgKyByZXN1bHQud2lkdGg7XG4gIHJlc3VsdFsnYm90dG9tJ10gPSByZXN1bHQudG9wICsgcmVzdWx0LmhlaWdodDtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblRXT19QSSA9IE1hdGguUEkgKiAyO1xuXG50b0Nzc0ZpZ3VyZSA9IGZ1bmN0aW9uKG51bSkge1xuICByZXR1cm4gbnVtLnRvUHJlY2lzaW9uKDgpO1xufTtcblxuUG9seW1lcih7XG4gIGlzOiAnZmxvd2VyLXBpY2tlcicsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBwZXRhbHM6IHtcbiAgICAgIHR5cGU6IEFycmF5XG4gICAgfSxcbiAgICByYWRpdXM6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIHZhbHVlOiA4MFxuICAgIH1cbiAgfSxcbiAgc3RhcnQ6IGZ1bmN0aW9uKG9yaWdpbikge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fc3Bhd25GbG93ZXIob3JpZ2luLCB0aGlzLnBldGFscyk7XG4gIH0sXG4gIGZpbmlzaDogZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIHgsIHk7XG4gICAgeCA9IGFyZy54LCB5ID0gYXJnLnk7XG4gICAgaWYgKCh0aGlzLl9vdmVyUGV0YWwgIT0gbnVsbCkgJiYgdGhpcy5fb3ZlclBldGFsLmlzTGVhZikge1xuICAgICAgdGhpcy5maXJlKCdzZWxlY3RlZCcsIHtcbiAgICAgICAgcGV0YWw6IHRoaXMuX292ZXJQZXRhbCxcbiAgICAgICAgdmFsdWU6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5fb3ZlclBldGFsLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9vdmVyUGV0YWwudmFsdWUoX3RoaXMuX292ZXJQZXRhbC5tb2RlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuX292ZXJQZXRhbC5tb2RlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSgpXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZmxvd2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGZsb3dlcikge1xuICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5wYXJlbnROb2RlKS5yZW1vdmVDaGlsZChmbG93ZXIuZWxlbWVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5fZmxvd2VycyA9IFtdO1xuICAgIHRoaXMuX292ZXJQZXRhbCA9IG51bGw7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH0sXG4gIF9mbG93ZXJzOiBbXSxcbiAgX292ZXJQZXRhbDogbnVsbCxcbiAgX2lzQWN0aXZlOiBmYWxzZSxcbiAgX2NvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJFsncGlja2VyLWNvbnRhaW5lciddO1xuICB9LFxuICBfY3JlYXRlUGV0YWxFbGVtZW50OiBmdW5jdGlvbihtb2RlbCwgZmxvd2VySW5kZXgpIHtcbiAgICB2YXIgcGV0YWw7XG4gICAgcGV0YWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpZiAobW9kZWwuaXNCYWNrUGV0YWwgPT0gbnVsbCkge1xuICAgICAgUG9seW1lci5kb20ocGV0YWwpLmNsYXNzTGlzdC5hZGQoJ3BldGFsJyk7XG4gICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgndW5zZWxlY3RhYmxlJyk7XG4gICAgICBwZXRhbC5hZGRFdmVudExpc3RlbmVyKCd0cmFja292ZXInLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faG92ZXJQZXRhbChwZXRhbCwgbW9kZWwsIGZsb3dlckluZGV4KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHBldGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Rvd24nLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faG92ZXJQZXRhbChwZXRhbCwgbW9kZWwsIGZsb3dlckluZGV4KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHBldGFsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrb3V0JywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkZXRhaWwpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3VuaG92ZXJQZXRhbChwZXRhbCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBQb2x5bWVyLmRvbShwZXRhbCkuaW5uZXJIVE1MID0gbW9kZWwuZGlzcGxheSAhPSBudWxsID8gbW9kZWwuZGlzcGxheShtb2RlbC5tb2RlbCkgOiBtb2RlbC5tb2RlbDtcbiAgICAgIGlmIChtb2RlbC5pc0xlYWYpIHtcbiAgICAgICAgUG9seW1lci5kb20ocGV0YWwpLmNsYXNzTGlzdC5hZGQoJ2xlYWYnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5jbGFzc0xpc3QuYWRkKCdicmFuY2gnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuXG4gICAgfVxuICAgIHJldHVybiBwZXRhbDtcbiAgfSxcbiAgX3NwYXduRmxvd2VyOiBmdW5jdGlvbihvcmlnaW4sIHBldGFscywgYmFja1BldGFsUG9pbnQpIHtcbiAgICB2YXIgYW5nbGVPZmZzZXQsIGZsb3dlciwgb2Zmc2V0Rmxvd2VyLCBvZmZzZXRQaXN0aWwsIHBldGFsRWxlbWVudHMsIHBpc3RpbCwgc3Bhd25pbmdGbG93ZXJJbmRleDtcbiAgICBzcGF3bmluZ0Zsb3dlckluZGV4ID0gdGhpcy5fZmxvd2Vycy5sZW5ndGg7XG4gICAgZmxvd2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZmxvd2VyLmlkID0gXCJmbG93ZXJcIiArIHNwYXduaW5nRmxvd2VySW5kZXg7XG4gICAgUG9seW1lci5kb20oZmxvd2VyKS5jbGFzc0xpc3QuYWRkKCdmbG93ZXInKTtcbiAgICBQb2x5bWVyLmRvbSh0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXSkuYXBwZW5kQ2hpbGQoZmxvd2VyKTtcbiAgICBwaXN0aWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwaXN0aWwuaWQgPSBcInBpc3RpbFwiICsgc3Bhd25pbmdGbG93ZXJJbmRleDtcbiAgICBQb2x5bWVyLmRvbShwaXN0aWwpLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbCcpO1xuICAgIFBvbHltZXIuZG9tKHBpc3RpbCkuY2xhc3NMaXN0LmFkZCgncGlzdGlsJyk7XG4gICAgUG9seW1lci5kb20oZmxvd2VyKS5hcHBlbmRDaGlsZChwaXN0aWwpO1xuICAgIG9mZnNldEZsb3dlciA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsZWZ0LCByZWYsIHRvcDtcbiAgICAgIHJlZiA9IGNlbnRlclRvT2Zmc2V0KG9yaWdpbiwgZmxvd2VyKSwgdG9wID0gcmVmLnRvcCwgbGVmdCA9IHJlZi5sZWZ0O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogdG9Dc3NGaWd1cmUobGVmdCksXG4gICAgICAgIHRvcDogdG9Dc3NGaWd1cmUodG9wKVxuICAgICAgfTtcbiAgICB9KSgpO1xuICAgIHRoaXMudHJhbnNmb3JtKFwidHJhbnNsYXRlKFwiICsgb2Zmc2V0Rmxvd2VyLmxlZnQgKyBcInB4LCBcIiArIG9mZnNldEZsb3dlci50b3AgKyBcInB4KVwiLCBmbG93ZXIpO1xuICAgIG9mZnNldFBpc3RpbCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmbG93ZXJDZW50ZXIsIGxlZnQsIHJlZiwgdG9wO1xuICAgICAgZmxvd2VyQ2VudGVyID0gZWxlbWVudENlbnRlclBvc2l0aW9uKGZsb3dlciwgZmxvd2VyKTtcbiAgICAgIHJlZiA9IGNlbnRlclRvT2Zmc2V0KGZsb3dlckNlbnRlciwgcGlzdGlsKSwgdG9wID0gcmVmLnRvcCwgbGVmdCA9IHJlZi5sZWZ0O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogdG9Dc3NGaWd1cmUobGVmdCksXG4gICAgICAgIHRvcDogdG9Dc3NGaWd1cmUodG9wKVxuICAgICAgfTtcbiAgICB9KSgpO1xuICAgIHRoaXMudHJhbnNmb3JtKFwidHJhbnNsYXRlKFwiICsgb2Zmc2V0UGlzdGlsLmxlZnQgKyBcInB4LCBcIiArIG9mZnNldFBpc3RpbC50b3AgKyBcInB4KVwiLCBwaXN0aWwpO1xuICAgIHBpc3RpbC5hZGRFdmVudExpc3RlbmVyKCd0cmFja292ZXInLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLl9ob3ZlclBpc3RpbChzcGF3bmluZ0Zsb3dlckluZGV4KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIGlmICh0aGlzLl9mbG93ZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhpcy5fZGVhY3RpdmF0ZUZsb3dlcih0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV0pO1xuICAgIH1cbiAgICBhbmdsZU9mZnNldCA9IChNYXRoLlBJIC8gKDIgKiBwZXRhbHMubGVuZ3RoKSkgKyBNYXRoLlBJO1xuICAgIHBldGFsRWxlbWVudHMgPSBwZXRhbHMubWFwKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVsbSwgaWR4KSB7XG4gICAgICAgIHZhciBjZW50ZXIsIGN1cnJlbnRCb3VuZHMsIG9mZnNldFBldGFsLCBwZXRhbCwgcG90ZW50aWFsUmVjdDtcbiAgICAgICAgcGV0YWwgPSBfdGhpcy5fY3JlYXRlUGV0YWxFbGVtZW50KGVsbSwgc3Bhd25pbmdGbG93ZXJJbmRleCk7XG4gICAgICAgIFBvbHltZXIuZG9tKGZsb3dlcikuYXBwZW5kQ2hpbGQocGV0YWwpO1xuICAgICAgICBjZW50ZXIgPSBwb2xUb0NhcihNYXRoLlBJICogaWR4IC8gcGV0YWxzLmxlbmd0aCArIGFuZ2xlT2Zmc2V0LCBfdGhpcy5yYWRpdXMpO1xuICAgICAgICBvZmZzZXRQZXRhbCA9IGNlbnRlclRvT2Zmc2V0KGNlbnRlciwgcGV0YWwpO1xuICAgICAgICBwb3RlbnRpYWxSZWN0ID0gcmVjdEZyb21PZmZzZXQocGV0YWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHtcbiAgICAgICAgICB4OiBvZmZzZXRQZXRhbC5sZWZ0LFxuICAgICAgICAgIHk6IG9mZnNldFBldGFsLnRvcFxuICAgICAgICB9KTtcbiAgICAgICAgY3VycmVudEJvdW5kcyA9IF90aGlzLl9jb250YWluZXIoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKCEoY2hlY2tDb250YWlubWVudChwb3RlbnRpYWxSZWN0LCBjdXJyZW50Qm91bmRzKSkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGNvbnRhaW5lZDogJywgcGV0YWwsIGN1cnJlbnRCb3VuZHMpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArICh0b0Nzc0ZpZ3VyZShvZmZzZXRQZXRhbC5sZWZ0KSkgKyBcInB4LCBcIiArICh0b0Nzc0ZpZ3VyZShvZmZzZXRQZXRhbC50b3ApKSArIFwicHgpXCIsIHBldGFsKTtcbiAgICAgICAgcmV0dXJuIHBldGFsO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMuX2Zsb3dlcnMucHVzaCh7XG4gICAgICBlbGVtZW50OiBmbG93ZXIsXG4gICAgICBvcmlnaW46IG9yaWdpblxuICAgIH0pO1xuICB9LFxuICBfZGVhY3RpdmF0ZUZsb3dlcjogZnVuY3Rpb24oZmxvd2VyKSB7XG4gICAgcmV0dXJuIFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5jaGlsZE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdwZXRhbCcpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZS1wZXRhbCcpO1xuICAgICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnZmxvd2VyJykpIHtcbiAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlLWZsb3dlcicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWN0aXZhdGVGbG93ZXI6IGZ1bmN0aW9uKGZsb3dlcikge1xuICAgIHJldHVybiBQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkuY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygncGV0YWwnKSkge1xuICAgICAgICBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZS1wZXRhbCcpO1xuICAgICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ292ZXItYnJhbmNoJykpIHtcbiAgICAgICAgICByZXR1cm4gUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LnJlbW92ZSgnb3Zlci1icmFuY2gnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnZmxvd2VyJykpIHtcbiAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlLWZsb3dlcicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcG9wRmxvd2VyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmxvd2VyLCBmbG93ZXJQYXJlbnQ7XG4gICAgaWYgKHRoaXMuX2Zsb3dlcnMubGVuZ3RoID4gMCkge1xuICAgICAgZmxvd2VyID0gdGhpcy5fZmxvd2Vyc1t0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgZmxvd2VyUGFyZW50ID0gUG9seW1lci5kb20oZmxvd2VyLmVsZW1lbnQpLnBhcmVudE5vZGU7XG4gICAgICBQb2x5bWVyLmRvbShmbG93ZXJQYXJlbnQpLnJlbW92ZUNoaWxkKGZsb3dlci5lbGVtZW50KTtcbiAgICAgIHRoaXMuX2Zsb3dlcnMuc3BsaWNlKHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSwgMSk7XG4gICAgICBpZiAodGhpcy5fZmxvd2Vycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2YXRlRmxvd2VyKHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfY3JlYXRlTGlua0VsZW1lbnRGcm9tOiBmdW5jdGlvbihmcm9tRmxvd2VySW5kZXgpIHtcbiAgICB2YXIgYW5nbGUsIGRzdCwgbGlua0VsbSwgc3JjO1xuICAgIGlmICgodGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxKSA+IChmcm9tRmxvd2VySW5kZXggKyAxKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggZmxvd2VycyB0byBtYWtlIHRoYXQgbGluayEnKTtcbiAgICB9XG4gICAgc3JjID0gdGhpcy5fZmxvd2Vyc1tmcm9tRmxvd2VySW5kZXhdO1xuICAgIGRzdCA9IHRoaXMuX2Zsb3dlcnNbZnJvbUZsb3dlckluZGV4ICsgMV07XG4gICAgYW5nbGUgPSAtTWF0aC5hY29zKChkc3Qub3JpZ2luLnggLSBzcmMub3JpZ2luLngpIC8gdGhpcy5yYWRpdXMpO1xuICAgIGxpbmtFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBQb2x5bWVyLmRvbSh0aGlzLl9jb250YWluZXIoKSkuYXBwZW5kQ2hpbGQobGlua0VsbSk7XG4gICAgUG9seW1lci5kb20obGlua0VsbSkuY2xhc3NMaXN0LmFkZCgncGlzdGlsLWxpbmsnKTtcbiAgICBsaW5rRWxtLnN0eWxlWydwb3NpdGlvbiddID0gJ2Fic29sdXRlJztcbiAgICBsaW5rRWxtLnN0eWxlWyd3aWR0aCddID0gdGhpcy5yYWRpdXMgKyBcInB4XCI7XG4gICAgbGlua0VsbS5zdHlsZVsnaGVpZ2h0J10gPSAnNXB4JztcbiAgICBsaW5rRWxtLnN0eWxlWyd0cmFuc2Zvcm0nXSA9IFwicm90YXRlKFwiICsgYW5nbGUgKyBcInJhZClcIjtcbiAgICBsaW5rRWxtLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnI2ZhYSc7XG4gICAgbGlua0VsbS5zdHlsZVsnbGVmdCddID0gc3JjLm9yaWdpbi54ICsgJ3B4JztcbiAgICBsaW5rRWxtLnN0eWxlWyd0b3AnXSA9IHNyYy5vcmlnaW4ueSArICdweCc7XG4gICAgcmV0dXJuIGxpbmtFbG0uc3R5bGVbJ3RyYW5zZm9ybS1vcmlnaW4nXSA9ICdjZW50ZXIgbGVmdCc7XG4gIH0sXG4gIF9ob3ZlclBldGFsOiBmdW5jdGlvbihwZXRhbEVsZW1lbnQsIHBldGFsTW9kZWwsIGZsb3dlckluZGV4KSB7XG4gICAgdmFyIGN1cnJGbG93ZXJFbG0sIGVsZW1lbnRDZW50ZXI7XG4gICAgaWYgKHRoaXMuX292ZXJQZXRhbCA9PT0gcGV0YWxNb2RlbCkge1xuXG4gICAgfSBlbHNlIGlmIChmbG93ZXJJbmRleCA9PT0gKHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIHBldGFsRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvdmVyLXBldGFsJyk7XG4gICAgICB0aGlzLl9vdmVyUGV0YWwgPSBwZXRhbE1vZGVsO1xuICAgICAgZWxlbWVudENlbnRlciA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpZWxkUmVjdCwgcGV0YWxSZWN0O1xuICAgICAgICAgIHBldGFsUmVjdCA9IHBldGFsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBmaWVsZFJlY3QgPSBfdGhpcy5fY29udGFpbmVyKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHBldGFsUmVjdC5sZWZ0IC0gZmllbGRSZWN0LmxlZnQgKyAocGV0YWxSZWN0LndpZHRoIC8gMiksXG4gICAgICAgICAgICB5OiBwZXRhbFJlY3QudG9wIC0gZmllbGRSZWN0LnRvcCArIChwZXRhbFJlY3QuaGVpZ2h0IC8gMilcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykoKTtcbiAgICAgIGlmICghdGhpcy5fb3ZlclBldGFsLmlzTGVhZikge1xuICAgICAgICBQb2x5bWVyLmRvbShwZXRhbEVsZW1lbnQpLmNsYXNzTGlzdC5hZGQoJ292ZXItYnJhbmNoJyk7XG4gICAgICAgIGN1cnJGbG93ZXJFbG0gPSB0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV0uZWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NwYXduRmxvd2VyKGVsZW1lbnRDZW50ZXIsIHRoaXMuX292ZXJQZXRhbC5jaGlsZHJlbiwgZWxlbWVudENlbnRlclBvc2l0aW9uKGN1cnJGbG93ZXJFbG0sIHRoaXMuX2NvbnRhaW5lcigpKSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfdW5ob3ZlclBldGFsOiBmdW5jdGlvbihwZXRhbEVsZW1lbnQpIHtcbiAgICBwZXRhbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3Zlci1wZXRhbCcpO1xuICAgIHJldHVybiB0aGlzLl9vdmVyUGV0YWwgPSBudWxsO1xuICB9LFxuICBfaG92ZXJQaXN0aWw6IGZ1bmN0aW9uKGRlcHRoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVzdWx0cztcbiAgICBpZiAoZGVwdGggPj0gdGhpcy5fZmxvd2Vycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcImhvdmVyaW5nIG92ZXIgcGlzdGlsIG9mIGRlcHRoIFwiICsgZGVwdGggKyBcIiwgYnV0IHRoZSBmbG93ZXIgc3RhY2sgaXMgb25seSBcIiArIHRoaXMuX2Zsb3dlcnMubGVuZ3RoICsgXCIgZGVlcC5cIik7XG4gICAgfSBlbHNlIGlmIChkZXB0aCAhPT0gdGhpcy5fZmxvd2Vycy5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IGogPSByZWYgPSB0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEsIHJlZjEgPSBkZXB0aCArIDE7IGogPj0gcmVmMTsgaSA9IGogKz0gLTEpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BvcEZsb3dlcigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfSxcbiAgX2hhbmRsZVVwOiBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgZGV0YWlsLCBmaWVsZFJlY3Q7XG4gICAgZGV0YWlsID0gYXJnLmRldGFpbDtcbiAgICBmaWVsZFJlY3QgPSB0aGlzLl9jb250YWluZXIoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2goe1xuICAgICAgeDogZGV0YWlsLnggLSBmaWVsZFJlY3QubGVmdCxcbiAgICAgIHk6IGRldGFpbC55IC0gZmllbGRSZWN0LnRvcFxuICAgIH0pO1xuICB9LFxuICBfbGFzdEhvdmVyOiBudWxsLFxuICBfaGFuZGxlVHJhY2s6IGZ1bmN0aW9uKGV2dCwgZGV0YWlsKSB7XG4gICAgdmFyIGhvdmVyO1xuICAgIGlmICh0eXBlb2YgZXZ0LnN0b3BQcm9wYWdhdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZXZ0LnByZXZlbnREZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBob3ZlciA9IGRldGFpbC5ob3ZlcigpO1xuICAgIHRoaXMuZmlyZSgndHJhY2tvdmVyJywgZGV0YWlsLCB7XG4gICAgICBub2RlOiBob3ZlclxuICAgIH0pO1xuICAgIGlmIChob3ZlciAhPT0gdGhpcy5fbGFzdEhvdmVyKSB7XG4gICAgICB0aGlzLmZpcmUoJ3RyYWNrb3V0JywgZGV0YWlsLCB7XG4gICAgICAgIG5vZGU6IHRoaXMuX2xhc3RIb3ZlclxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5fbGFzdEhvdmVyID0gaG92ZXI7XG4gICAgfVxuICB9XG59KTtcbiJdfQ==
