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
  listeners: {
    'track': '_handleTrack'
  },
  start: function(origin) {
    return this._spawnFlower(origin, this.petals);
  },
  finish: function(arg) {
    var x, y;
    x = arg.x, y = arg.y;
    if ((this._overPetal != null) && this._overPetal.isLeaf) {
      this.fire('selected', {
        petal: this._overPetal,
        value: this._overPetal.value != null ? this._overPetal.value(this._overPetal.model) : this._overPetal.model
      });
    }
    this._flowers.forEach(function(flower) {
      return Polymer.dom(Polymer.dom(flower.element).parentNode).removeChild(flower.element);
    });
    this._flowers = [];
    return this._overPetal = null;
  },
  _flowers: [],
  _overPetal: null,
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
    Polymer.dom(flower).setAttribute('id', "flower" + spawningFlowerIndex);
    Polymer.dom(flower).classList.add('flower');
    Polymer.dom(this.$['picker-container']).appendChild(flower);
    pistil = document.createElement('div');
    Polymer.dom(pistil).classList.add('pistil');
    Polymer.dom(pistil).classList.add('unselectable');
    Polymer.dom(pistil).setAttribute('id', "pistil" + spawningFlowerIndex);
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
      var left, ref, top;
      ref = centerToOffset(elementCenterPosition(flower, flower), pistil), top = ref.top, left = ref.left;
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
        var center, offsetPetal, petal, potentialRect;
        petal = _this._createPetalElement(elm, spawningFlowerIndex);
        Polymer.dom(flower).appendChild(petal);
        center = polToCar(Math.PI * idx / petals.length + angleOffset, _this.radius);
        offsetPetal = centerToOffset(center, petal);
        potentialRect = rectFromOffset(petal.getBoundingClientRect(), {
          x: offsetPetal.left,
          y: offsetPetal.top
        });
        if (!(checkContainment(potentialRect, _this._container().getBoundingClientRect()))) {
          console.log('not contained: ', petal);
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
    var flower;
    if (this._flowers.length > 0) {
      flower = this._flowers[this._flowers.length - 1];
      Polymer.dom(Polymer.dom(flower.element).parentNode).removeChild(flower.element);
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
    linkElm.style['hßeight'] = '5px';
    linkElm.style['transform'] = "rotate(" + angle + "rad)";
    linkElm.style['background-color'] = '#faa';
    linkElm.style['left'] = src.origin.x + 'px';
    linkElm.style['top'] = src.origin.y + 'px';
    return linkElm.style['transform-origin'] = 'center left';
  },
  _hoverPetal: function(petalElement, petalModel, flowerIndex) {
    var elementCenter;
    if (this._overPetal === petalModel) {

    } else if (flowerIndex === (this._flowers.length - 1)) {
      petalElement.classList.add('over-petal');
      this._overPetal = petalModel;
      elementCenter = (function(_this) {
        return function() {
          var fieldRect, petalRect;
          petalRect = petalElement.getBoundingClientRect();
          fieldRect = _this.$['picker-container'].getBoundingClientRect();
          return {
            x: petalRect.left - fieldRect.left + (petalRect.width / 2),
            y: petalRect.top - fieldRect.top + (petalRect.height / 2)
          };
        };
      })(this)();
      if (!this._overPetal.isLeaf) {
        Polymer.dom(petalElement).classList.add('over-branch');
        this._spawnFlower(elementCenter, this._overPetal.children, elementCenterPosition(this._flowers[this._flowers.length - 1].element, this.$['picker-container']));
        return this._createLinkElementFrom(flowerIndex);
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
  _unhoverPistil: function(index) {},
  _handleDown: function(arg) {
    var detail, fieldRect;
    detail = arg.detail;
    fieldRect = this.$['picker-container'].getBoundingClientRect();
    return this.start({
      x: detail.x - fieldRect.left,
      y: detail.y - fieldRect.top
    });
  },
  _handleUp: function(arg) {
    var detail, fieldRect;
    detail = arg.detail;
    fieldRect = this.$['picker-container'].getBoundingClientRect();
    return this.finish({
      x: detail.x - fieldRect.left,
      y: detail.y - fieldRect.top
    });
  },
  _lastHover: null,
  _handleTrack: function(evt, detail) {
    var hover;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ndWxwLWNvZmZlZWlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZmxvd2VyLXBpY2tlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVFdPX1BJLCBjZW50ZXJUb09mZnNldCwgY2hlY2tDb250YWlubWVudCwgZWxlbWVudENlbnRlclBvc2l0aW9uLCBwb2xUb0NhciwgcmVjdEZyb21PZmZzZXQsIHRvQ3NzRmlndXJlO1xuXG5wb2xUb0NhciA9IGZ1bmN0aW9uKGFuZ2xlLCByYWRpdXMpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiByYWRpdXMgKiAoTWF0aC5jb3MoYW5nbGUpKSxcbiAgICB5OiByYWRpdXMgKiAoTWF0aC5zaW4oYW5nbGUpKVxuICB9O1xufTtcblxuY2VudGVyVG9PZmZzZXQgPSBmdW5jdGlvbihhcmcsIGVsZW1lbnQpIHtcbiAgdmFyIHJlY3QsIHgsIHk7XG4gIHggPSBhcmcueCwgeSA9IGFyZy55O1xuICByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IHkgLSAocmVjdC5oZWlnaHQgLyAyKSxcbiAgICBsZWZ0OiB4IC0gKHJlY3Qud2lkdGggLyAyKVxuICB9O1xufTtcblxuZWxlbWVudENlbnRlclBvc2l0aW9uID0gZnVuY3Rpb24oZWxlbWVudCwgcmVsYXRpdmVUbykge1xuICB2YXIgZWxtQm91bmRzLCByZWxCb3VuZHM7XG4gIGVsbUJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJlbEJvdW5kcyA9IHJlbGF0aXZlVG8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgeDogZWxtQm91bmRzLmxlZnQgLSByZWxCb3VuZHMubGVmdCArIChlbG1Cb3VuZHMud2lkdGggLyAyKSxcbiAgICB5OiBlbG1Cb3VuZHMudG9wIC0gcmVsQm91bmRzLnRvcCArIChlbG1Cb3VuZHMuaGVpZ2h0IC8gMilcbiAgfTtcbn07XG5cbmNoZWNrQ29udGFpbm1lbnQgPSBmdW5jdGlvbihzdWJSZWN0LCBpblJlY3QpIHtcbiAgcmV0dXJuIChzdWJSZWN0LmxlZnQgPj0gaW5SZWN0LmxlZnQpICYmIChzdWJSZWN0LnRvcCA+PSBpblJlY3QudG9wKSAmJiAoc3ViUmVjdC5yaWdodCA8PSBpblJlY3QucmlnaHQpICYmIChzdWJSZWN0LmJvdHRvbSA8PSBpblJlY3QuYm90dG9tKTtcbn07XG5cbnJlY3RGcm9tT2Zmc2V0ID0gZnVuY3Rpb24oYmFzZVJlY3QsIGFyZykge1xuICB2YXIgcmVzdWx0LCB4LCB5O1xuICB4ID0gYXJnLngsIHkgPSBhcmcueTtcbiAgcmVzdWx0ID0ge1xuICAgIGxlZnQ6IHggKyBiYXNlUmVjdC5sZWZ0LFxuICAgIHRvcDogeSArIGJhc2VSZWN0LnRvcCxcbiAgICB3aWR0aDogYmFzZVJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiBiYXNlUmVjdC5oZWlnaHRcbiAgfTtcbiAgcmVzdWx0WydyaWdodCddID0gcmVzdWx0LmxlZnQgKyByZXN1bHQud2lkdGg7XG4gIHJlc3VsdFsnYm90dG9tJ10gPSByZXN1bHQudG9wICsgcmVzdWx0LmhlaWdodDtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblRXT19QSSA9IE1hdGguUEkgKiAyO1xuXG50b0Nzc0ZpZ3VyZSA9IGZ1bmN0aW9uKG51bSkge1xuICByZXR1cm4gbnVtLnRvUHJlY2lzaW9uKDgpO1xufTtcblxuUG9seW1lcih7XG4gIGlzOiAnZmxvd2VyLXBpY2tlcicsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBwZXRhbHM6IHtcbiAgICAgIHR5cGU6IEFycmF5XG4gICAgfSxcbiAgICByYWRpdXM6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIHZhbHVlOiA4MFxuICAgIH1cbiAgfSxcbiAgbGlzdGVuZXJzOiB7XG4gICAgJ3RyYWNrJzogJ19oYW5kbGVUcmFjaydcbiAgfSxcbiAgc3RhcnQ6IGZ1bmN0aW9uKG9yaWdpbikge1xuICAgIHJldHVybiB0aGlzLl9zcGF3bkZsb3dlcihvcmlnaW4sIHRoaXMucGV0YWxzKTtcbiAgfSxcbiAgZmluaXNoOiBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gYXJnLngsIHkgPSBhcmcueTtcbiAgICBpZiAoKHRoaXMuX292ZXJQZXRhbCAhPSBudWxsKSAmJiB0aGlzLl9vdmVyUGV0YWwuaXNMZWFmKSB7XG4gICAgICB0aGlzLmZpcmUoJ3NlbGVjdGVkJywge1xuICAgICAgICBwZXRhbDogdGhpcy5fb3ZlclBldGFsLFxuICAgICAgICB2YWx1ZTogdGhpcy5fb3ZlclBldGFsLnZhbHVlICE9IG51bGwgPyB0aGlzLl9vdmVyUGV0YWwudmFsdWUodGhpcy5fb3ZlclBldGFsLm1vZGVsKSA6IHRoaXMuX292ZXJQZXRhbC5tb2RlbFxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2Zsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmbG93ZXIpIHtcbiAgICAgIHJldHVybiBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkucGFyZW50Tm9kZSkucmVtb3ZlQ2hpbGQoZmxvd2VyLmVsZW1lbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX2Zsb3dlcnMgPSBbXTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlclBldGFsID0gbnVsbDtcbiAgfSxcbiAgX2Zsb3dlcnM6IFtdLFxuICBfb3ZlclBldGFsOiBudWxsLFxuICBfY29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kWydwaWNrZXItY29udGFpbmVyJ107XG4gIH0sXG4gIF9jcmVhdGVQZXRhbEVsZW1lbnQ6IGZ1bmN0aW9uKG1vZGVsLCBmbG93ZXJJbmRleCkge1xuICAgIHZhciBwZXRhbDtcbiAgICBwZXRhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlmIChtb2RlbC5pc0JhY2tQZXRhbCA9PSBudWxsKSB7XG4gICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgncGV0YWwnKTtcbiAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5jbGFzc0xpc3QuYWRkKCd1bnNlbGVjdGFibGUnKTtcbiAgICAgIHBldGFsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrb3ZlcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlsKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9ob3ZlclBldGFsKHBldGFsLCBtb2RlbCwgZmxvd2VySW5kZXgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcGV0YWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2tvdXQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fdW5ob3ZlclBldGFsKHBldGFsKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5pbm5lckhUTUwgPSBtb2RlbC5kaXNwbGF5ICE9IG51bGwgPyBtb2RlbC5kaXNwbGF5KG1vZGVsLm1vZGVsKSA6IG1vZGVsLm1vZGVsO1xuICAgICAgaWYgKG1vZGVsLmlzTGVhZikge1xuICAgICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgnbGVhZicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUG9seW1lci5kb20ocGV0YWwpLmNsYXNzTGlzdC5hZGQoJ2JyYW5jaCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICB9XG4gICAgcmV0dXJuIHBldGFsO1xuICB9LFxuICBfc3Bhd25GbG93ZXI6IGZ1bmN0aW9uKG9yaWdpbiwgcGV0YWxzLCBiYWNrUGV0YWxQb2ludCkge1xuICAgIHZhciBhbmdsZU9mZnNldCwgZmxvd2VyLCBvZmZzZXRGbG93ZXIsIG9mZnNldFBpc3RpbCwgcGV0YWxFbGVtZW50cywgcGlzdGlsLCBzcGF3bmluZ0Zsb3dlckluZGV4O1xuICAgIHNwYXduaW5nRmxvd2VySW5kZXggPSB0aGlzLl9mbG93ZXJzLmxlbmd0aDtcbiAgICBmbG93ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBQb2x5bWVyLmRvbShmbG93ZXIpLnNldEF0dHJpYnV0ZSgnaWQnLCBcImZsb3dlclwiICsgc3Bhd25pbmdGbG93ZXJJbmRleCk7XG4gICAgUG9seW1lci5kb20oZmxvd2VyKS5jbGFzc0xpc3QuYWRkKCdmbG93ZXInKTtcbiAgICBQb2x5bWVyLmRvbSh0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXSkuYXBwZW5kQ2hpbGQoZmxvd2VyKTtcbiAgICBwaXN0aWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBQb2x5bWVyLmRvbShwaXN0aWwpLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbCcpO1xuICAgIFBvbHltZXIuZG9tKHBpc3RpbCkuY2xhc3NMaXN0LmFkZCgndW5zZWxlY3RhYmxlJyk7XG4gICAgUG9seW1lci5kb20ocGlzdGlsKS5zZXRBdHRyaWJ1dGUoJ2lkJywgXCJwaXN0aWxcIiArIHNwYXduaW5nRmxvd2VySW5kZXgpO1xuICAgIFBvbHltZXIuZG9tKGZsb3dlcikuYXBwZW5kQ2hpbGQocGlzdGlsKTtcbiAgICBvZmZzZXRGbG93ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVmdCwgcmVmLCB0b3A7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChvcmlnaW4sIGZsb3dlciksIHRvcCA9IHJlZi50b3AsIGxlZnQgPSByZWYubGVmdDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHRvQ3NzRmlndXJlKGxlZnQpLFxuICAgICAgICB0b3A6IHRvQ3NzRmlndXJlKHRvcClcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgICB0aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArIG9mZnNldEZsb3dlci5sZWZ0ICsgXCJweCwgXCIgKyBvZmZzZXRGbG93ZXIudG9wICsgXCJweClcIiwgZmxvd2VyKTtcbiAgICBvZmZzZXRQaXN0aWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVmdCwgcmVmLCB0b3A7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChlbGVtZW50Q2VudGVyUG9zaXRpb24oZmxvd2VyLCBmbG93ZXIpLCBwaXN0aWwpLCB0b3AgPSByZWYudG9wLCBsZWZ0ID0gcmVmLmxlZnQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiB0b0Nzc0ZpZ3VyZShsZWZ0KSxcbiAgICAgICAgdG9wOiB0b0Nzc0ZpZ3VyZSh0b3ApXG4gICAgICB9O1xuICAgIH0pKCk7XG4gICAgdGhpcy50cmFuc2Zvcm0oXCJ0cmFuc2xhdGUoXCIgKyBvZmZzZXRQaXN0aWwubGVmdCArIFwicHgsIFwiICsgb2Zmc2V0UGlzdGlsLnRvcCArIFwicHgpXCIsIHBpc3RpbCk7XG4gICAgcGlzdGlsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrb3ZlcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuX2hvdmVyUGlzdGlsKHNwYXduaW5nRmxvd2VySW5kZXgpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgaWYgKHRoaXMuX2Zsb3dlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlRmxvd2VyKHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXSk7XG4gICAgfVxuICAgIGFuZ2xlT2Zmc2V0ID0gKE1hdGguUEkgLyAoMiAqIHBldGFscy5sZW5ndGgpKSArIE1hdGguUEk7XG4gICAgcGV0YWxFbGVtZW50cyA9IHBldGFscy5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWxtLCBpZHgpIHtcbiAgICAgICAgdmFyIGNlbnRlciwgb2Zmc2V0UGV0YWwsIHBldGFsLCBwb3RlbnRpYWxSZWN0O1xuICAgICAgICBwZXRhbCA9IF90aGlzLl9jcmVhdGVQZXRhbEVsZW1lbnQoZWxtLCBzcGF3bmluZ0Zsb3dlckluZGV4KTtcbiAgICAgICAgUG9seW1lci5kb20oZmxvd2VyKS5hcHBlbmRDaGlsZChwZXRhbCk7XG4gICAgICAgIGNlbnRlciA9IHBvbFRvQ2FyKE1hdGguUEkgKiBpZHggLyBwZXRhbHMubGVuZ3RoICsgYW5nbGVPZmZzZXQsIF90aGlzLnJhZGl1cyk7XG4gICAgICAgIG9mZnNldFBldGFsID0gY2VudGVyVG9PZmZzZXQoY2VudGVyLCBwZXRhbCk7XG4gICAgICAgIHBvdGVudGlhbFJlY3QgPSByZWN0RnJvbU9mZnNldChwZXRhbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwge1xuICAgICAgICAgIHg6IG9mZnNldFBldGFsLmxlZnQsXG4gICAgICAgICAgeTogb2Zmc2V0UGV0YWwudG9wXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIShjaGVja0NvbnRhaW5tZW50KHBvdGVudGlhbFJlY3QsIF90aGlzLl9jb250YWluZXIoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSkpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBjb250YWluZWQ6ICcsIHBldGFsKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy50cmFuc2Zvcm0oXCJ0cmFuc2xhdGUoXCIgKyAodG9Dc3NGaWd1cmUob2Zmc2V0UGV0YWwubGVmdCkpICsgXCJweCwgXCIgKyAodG9Dc3NGaWd1cmUob2Zmc2V0UGV0YWwudG9wKSkgKyBcInB4KVwiLCBwZXRhbCk7XG4gICAgICAgIHJldHVybiBwZXRhbDtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLl9mbG93ZXJzLnB1c2goe1xuICAgICAgZWxlbWVudDogZmxvd2VyLFxuICAgICAgb3JpZ2luOiBvcmlnaW5cbiAgICB9KTtcbiAgfSxcbiAgX2RlYWN0aXZhdGVGbG93ZXI6IGZ1bmN0aW9uKGZsb3dlcikge1xuICAgIHJldHVybiBQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkuY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygncGV0YWwnKSkge1xuICAgICAgICByZXR1cm4gUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUtcGV0YWwnKTtcbiAgICAgIH0gZWxzZSBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Zsb3dlcicpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZS1mbG93ZXInKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2FjdGl2YXRlRmxvd2VyOiBmdW5jdGlvbihmbG93ZXIpIHtcbiAgICByZXR1cm4gUG9seW1lci5kb20oZmxvd2VyLmVsZW1lbnQpLmNoaWxkTm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BldGFsJykpIHtcbiAgICAgICAgUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUtcGV0YWwnKTtcbiAgICAgICAgaWYgKG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdvdmVyLWJyYW5jaCcpKSB7XG4gICAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXItYnJhbmNoJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Zsb3dlcicpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZS1mbG93ZXInKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3BvcEZsb3dlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZsb3dlcjtcbiAgICBpZiAodGhpcy5fZmxvd2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICBmbG93ZXIgPSB0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV07XG4gICAgICBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkucGFyZW50Tm9kZSkucmVtb3ZlQ2hpbGQoZmxvd2VyLmVsZW1lbnQpO1xuICAgICAgdGhpcy5fZmxvd2Vycy5zcGxpY2UodGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxLCAxKTtcbiAgICAgIGlmICh0aGlzLl9mbG93ZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZhdGVGbG93ZXIodGhpcy5fZmxvd2Vyc1t0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9jcmVhdGVMaW5rRWxlbWVudEZyb206IGZ1bmN0aW9uKGZyb21GbG93ZXJJbmRleCkge1xuICAgIHZhciBhbmdsZSwgZHN0LCBsaW5rRWxtLCBzcmM7XG4gICAgaWYgKCh0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEpID4gKGZyb21GbG93ZXJJbmRleCArIDEpKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm90IGVub3VnaCBmbG93ZXJzIHRvIG1ha2UgdGhhdCBsaW5rIScpO1xuICAgIH1cbiAgICBzcmMgPSB0aGlzLl9mbG93ZXJzW2Zyb21GbG93ZXJJbmRleF07XG4gICAgZHN0ID0gdGhpcy5fZmxvd2Vyc1tmcm9tRmxvd2VySW5kZXggKyAxXTtcbiAgICBhbmdsZSA9IC1NYXRoLmFjb3MoKGRzdC5vcmlnaW4ueCAtIHNyYy5vcmlnaW4ueCkgLyB0aGlzLnJhZGl1cyk7XG4gICAgbGlua0VsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIFBvbHltZXIuZG9tKHRoaXMuX2NvbnRhaW5lcigpKS5hcHBlbmRDaGlsZChsaW5rRWxtKTtcbiAgICBQb2x5bWVyLmRvbShsaW5rRWxtKS5jbGFzc0xpc3QuYWRkKCdwaXN0aWwtbGluaycpO1xuICAgIGxpbmtFbG0uc3R5bGVbJ3Bvc2l0aW9uJ10gPSAnYWJzb2x1dGUnO1xuICAgIGxpbmtFbG0uc3R5bGVbJ3dpZHRoJ10gPSB0aGlzLnJhZGl1cyArIFwicHhcIjtcbiAgICBsaW5rRWxtLnN0eWxlWydow59laWdodCddID0gJzVweCc7XG4gICAgbGlua0VsbS5zdHlsZVsndHJhbnNmb3JtJ10gPSBcInJvdGF0ZShcIiArIGFuZ2xlICsgXCJyYWQpXCI7XG4gICAgbGlua0VsbS5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJyNmYWEnO1xuICAgIGxpbmtFbG0uc3R5bGVbJ2xlZnQnXSA9IHNyYy5vcmlnaW4ueCArICdweCc7XG4gICAgbGlua0VsbS5zdHlsZVsndG9wJ10gPSBzcmMub3JpZ2luLnkgKyAncHgnO1xuICAgIHJldHVybiBsaW5rRWxtLnN0eWxlWyd0cmFuc2Zvcm0tb3JpZ2luJ10gPSAnY2VudGVyIGxlZnQnO1xuICB9LFxuICBfaG92ZXJQZXRhbDogZnVuY3Rpb24ocGV0YWxFbGVtZW50LCBwZXRhbE1vZGVsLCBmbG93ZXJJbmRleCkge1xuICAgIHZhciBlbGVtZW50Q2VudGVyO1xuICAgIGlmICh0aGlzLl9vdmVyUGV0YWwgPT09IHBldGFsTW9kZWwpIHtcblxuICAgIH0gZWxzZSBpZiAoZmxvd2VySW5kZXggPT09ICh0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBwZXRhbEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3Zlci1wZXRhbCcpO1xuICAgICAgdGhpcy5fb3ZlclBldGFsID0gcGV0YWxNb2RlbDtcbiAgICAgIGVsZW1lbnRDZW50ZXIgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaWVsZFJlY3QsIHBldGFsUmVjdDtcbiAgICAgICAgICBwZXRhbFJlY3QgPSBwZXRhbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgZmllbGRSZWN0ID0gX3RoaXMuJFsncGlja2VyLWNvbnRhaW5lciddLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwZXRhbFJlY3QubGVmdCAtIGZpZWxkUmVjdC5sZWZ0ICsgKHBldGFsUmVjdC53aWR0aCAvIDIpLFxuICAgICAgICAgICAgeTogcGV0YWxSZWN0LnRvcCAtIGZpZWxkUmVjdC50b3AgKyAocGV0YWxSZWN0LmhlaWdodCAvIDIpXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKCk7XG4gICAgICBpZiAoIXRoaXMuX292ZXJQZXRhbC5pc0xlYWYpIHtcbiAgICAgICAgUG9seW1lci5kb20ocGV0YWxFbGVtZW50KS5jbGFzc0xpc3QuYWRkKCdvdmVyLWJyYW5jaCcpO1xuICAgICAgICB0aGlzLl9zcGF3bkZsb3dlcihlbGVtZW50Q2VudGVyLCB0aGlzLl9vdmVyUGV0YWwuY2hpbGRyZW4sIGVsZW1lbnRDZW50ZXJQb3NpdGlvbih0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV0uZWxlbWVudCwgdGhpcy4kWydwaWNrZXItY29udGFpbmVyJ10pKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUxpbmtFbGVtZW50RnJvbShmbG93ZXJJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfdW5ob3ZlclBldGFsOiBmdW5jdGlvbihwZXRhbEVsZW1lbnQpIHtcbiAgICBwZXRhbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3Zlci1wZXRhbCcpO1xuICAgIHJldHVybiB0aGlzLl9vdmVyUGV0YWwgPSBudWxsO1xuICB9LFxuICBfaG92ZXJQaXN0aWw6IGZ1bmN0aW9uKGRlcHRoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVzdWx0cztcbiAgICBpZiAoZGVwdGggPj0gdGhpcy5fZmxvd2Vycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcImhvdmVyaW5nIG92ZXIgcGlzdGlsIG9mIGRlcHRoIFwiICsgZGVwdGggKyBcIiwgYnV0IHRoZSBmbG93ZXIgc3RhY2sgaXMgb25seSBcIiArIHRoaXMuX2Zsb3dlcnMubGVuZ3RoICsgXCIgZGVlcC5cIik7XG4gICAgfSBlbHNlIGlmIChkZXB0aCAhPT0gdGhpcy5fZmxvd2Vycy5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IGogPSByZWYgPSB0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEsIHJlZjEgPSBkZXB0aCArIDE7IGogPj0gcmVmMTsgaSA9IGogKz0gLTEpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BvcEZsb3dlcigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfSxcbiAgX3VuaG92ZXJQaXN0aWw6IGZ1bmN0aW9uKGluZGV4KSB7fSxcbiAgX2hhbmRsZURvd246IGZ1bmN0aW9uKGFyZykge1xuICAgIHZhciBkZXRhaWwsIGZpZWxkUmVjdDtcbiAgICBkZXRhaWwgPSBhcmcuZGV0YWlsO1xuICAgIGZpZWxkUmVjdCA9IHRoaXMuJFsncGlja2VyLWNvbnRhaW5lciddLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB0aGlzLnN0YXJ0KHtcbiAgICAgIHg6IGRldGFpbC54IC0gZmllbGRSZWN0LmxlZnQsXG4gICAgICB5OiBkZXRhaWwueSAtIGZpZWxkUmVjdC50b3BcbiAgICB9KTtcbiAgfSxcbiAgX2hhbmRsZVVwOiBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgZGV0YWlsLCBmaWVsZFJlY3Q7XG4gICAgZGV0YWlsID0gYXJnLmRldGFpbDtcbiAgICBmaWVsZFJlY3QgPSB0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2goe1xuICAgICAgeDogZGV0YWlsLnggLSBmaWVsZFJlY3QubGVmdCxcbiAgICAgIHk6IGRldGFpbC55IC0gZmllbGRSZWN0LnRvcFxuICAgIH0pO1xuICB9LFxuICBfbGFzdEhvdmVyOiBudWxsLFxuICBfaGFuZGxlVHJhY2s6IGZ1bmN0aW9uKGV2dCwgZGV0YWlsKSB7XG4gICAgdmFyIGhvdmVyO1xuICAgIGhvdmVyID0gZGV0YWlsLmhvdmVyKCk7XG4gICAgdGhpcy5maXJlKCd0cmFja292ZXInLCBkZXRhaWwsIHtcbiAgICAgIG5vZGU6IGhvdmVyXG4gICAgfSk7XG4gICAgaWYgKGhvdmVyICE9PSB0aGlzLl9sYXN0SG92ZXIpIHtcbiAgICAgIHRoaXMuZmlyZSgndHJhY2tvdXQnLCBkZXRhaWwsIHtcbiAgICAgICAgbm9kZTogdGhpcy5fbGFzdEhvdmVyXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLl9sYXN0SG92ZXIgPSBob3ZlcjtcbiAgICB9XG4gIH1cbn0pO1xuIl19
