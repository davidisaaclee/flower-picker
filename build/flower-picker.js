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
  _unhoverPistil: function(index) {},
  _handleDown: function(arg) {
    var detail, fieldRect;
    detail = arg.detail;
    fieldRect = this._container().getBoundingClientRect();
    return this.start({
      x: detail.x - fieldRect.left,
      y: detail.y - fieldRect.top
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ndWxwLWNvZmZlZWlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZmxvd2VyLXBpY2tlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRXT19QSSwgY2VudGVyVG9PZmZzZXQsIGNoZWNrQ29udGFpbm1lbnQsIGVsZW1lbnRDZW50ZXJQb3NpdGlvbiwgcG9sVG9DYXIsIHJlY3RGcm9tT2Zmc2V0LCB0b0Nzc0ZpZ3VyZTtcblxucG9sVG9DYXIgPSBmdW5jdGlvbihhbmdsZSwgcmFkaXVzKSB7XG4gIHJldHVybiB7XG4gICAgeDogcmFkaXVzICogKE1hdGguY29zKGFuZ2xlKSksXG4gICAgeTogcmFkaXVzICogKE1hdGguc2luKGFuZ2xlKSlcbiAgfTtcbn07XG5cbmNlbnRlclRvT2Zmc2V0ID0gZnVuY3Rpb24oYXJnLCBlbGVtZW50KSB7XG4gIHZhciByZWN0LCB4LCB5O1xuICB4ID0gYXJnLngsIHkgPSBhcmcueTtcbiAgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgdG9wOiB5IC0gKHJlY3QuaGVpZ2h0IC8gMiksXG4gICAgbGVmdDogeCAtIChyZWN0LndpZHRoIC8gMilcbiAgfTtcbn07XG5cbmVsZW1lbnRDZW50ZXJQb3NpdGlvbiA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlbGF0aXZlVG8pIHtcbiAgdmFyIGVsbUJvdW5kcywgcmVsQm91bmRzO1xuICBlbG1Cb3VuZHMgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZWxCb3VuZHMgPSByZWxhdGl2ZVRvLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHg6IGVsbUJvdW5kcy5sZWZ0IC0gcmVsQm91bmRzLmxlZnQgKyAoZWxtQm91bmRzLndpZHRoIC8gMiksXG4gICAgeTogZWxtQm91bmRzLnRvcCAtIHJlbEJvdW5kcy50b3AgKyAoZWxtQm91bmRzLmhlaWdodCAvIDIpXG4gIH07XG59O1xuXG5jaGVja0NvbnRhaW5tZW50ID0gZnVuY3Rpb24oc3ViUmVjdCwgaW5SZWN0KSB7XG4gIHJldHVybiAoc3ViUmVjdC5sZWZ0ID49IGluUmVjdC5sZWZ0KSAmJiAoc3ViUmVjdC50b3AgPj0gaW5SZWN0LnRvcCkgJiYgKHN1YlJlY3QucmlnaHQgPD0gaW5SZWN0LnJpZ2h0KSAmJiAoc3ViUmVjdC5ib3R0b20gPD0gaW5SZWN0LmJvdHRvbSk7XG59O1xuXG5yZWN0RnJvbU9mZnNldCA9IGZ1bmN0aW9uKGJhc2VSZWN0LCBhcmcpIHtcbiAgdmFyIHJlc3VsdCwgeCwgeTtcbiAgeCA9IGFyZy54LCB5ID0gYXJnLnk7XG4gIHJlc3VsdCA9IHtcbiAgICBsZWZ0OiB4ICsgYmFzZVJlY3QubGVmdCxcbiAgICB0b3A6IHkgKyBiYXNlUmVjdC50b3AsXG4gICAgd2lkdGg6IGJhc2VSZWN0LndpZHRoLFxuICAgIGhlaWdodDogYmFzZVJlY3QuaGVpZ2h0XG4gIH07XG4gIHJlc3VsdFsncmlnaHQnXSA9IHJlc3VsdC5sZWZ0ICsgcmVzdWx0LndpZHRoO1xuICByZXN1bHRbJ2JvdHRvbSddID0gcmVzdWx0LnRvcCArIHJlc3VsdC5oZWlnaHQ7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5UV09fUEkgPSBNYXRoLlBJICogMjtcblxudG9Dc3NGaWd1cmUgPSBmdW5jdGlvbihudW0pIHtcbiAgcmV0dXJuIG51bS50b1ByZWNpc2lvbig4KTtcbn07XG5cblBvbHltZXIoe1xuICBpczogJ2Zsb3dlci1waWNrZXInLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgcGV0YWxzOiB7XG4gICAgICB0eXBlOiBBcnJheVxuICAgIH0sXG4gICAgcmFkaXVzOiB7XG4gICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICB2YWx1ZTogODBcbiAgICB9XG4gIH0sXG4gIGxpc3RlbmVyczoge1xuICAgICd0cmFjayc6ICdfaGFuZGxlVHJhY2snXG4gIH0sXG4gIHN0YXJ0OiBmdW5jdGlvbihvcmlnaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fc3Bhd25GbG93ZXIob3JpZ2luLCB0aGlzLnBldGFscyk7XG4gIH0sXG4gIGZpbmlzaDogZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIHgsIHk7XG4gICAgeCA9IGFyZy54LCB5ID0gYXJnLnk7XG4gICAgaWYgKCh0aGlzLl9vdmVyUGV0YWwgIT0gbnVsbCkgJiYgdGhpcy5fb3ZlclBldGFsLmlzTGVhZikge1xuICAgICAgdGhpcy5maXJlKCdzZWxlY3RlZCcsIHtcbiAgICAgICAgcGV0YWw6IHRoaXMuX292ZXJQZXRhbCxcbiAgICAgICAgdmFsdWU6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5fb3ZlclBldGFsLnZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9vdmVyUGV0YWwudmFsdWUoX3RoaXMuX292ZXJQZXRhbC5tb2RlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuX292ZXJQZXRhbC5tb2RlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSgpXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZmxvd2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGZsb3dlcikge1xuICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5wYXJlbnROb2RlKS5yZW1vdmVDaGlsZChmbG93ZXIuZWxlbWVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5fZmxvd2VycyA9IFtdO1xuICAgIHJldHVybiB0aGlzLl9vdmVyUGV0YWwgPSBudWxsO1xuICB9LFxuICBfZmxvd2VyczogW10sXG4gIF9vdmVyUGV0YWw6IG51bGwsXG4gIF9jb250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXTtcbiAgfSxcbiAgX2NyZWF0ZVBldGFsRWxlbWVudDogZnVuY3Rpb24obW9kZWwsIGZsb3dlckluZGV4KSB7XG4gICAgdmFyIHBldGFsO1xuICAgIHBldGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaWYgKG1vZGVsLmlzQmFja1BldGFsID09IG51bGwpIHtcbiAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5jbGFzc0xpc3QuYWRkKCdwZXRhbCcpO1xuICAgICAgUG9seW1lci5kb20ocGV0YWwpLmNsYXNzTGlzdC5hZGQoJ3Vuc2VsZWN0YWJsZScpO1xuICAgICAgcGV0YWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2tvdmVyJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkZXRhaWwpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX2hvdmVyUGV0YWwocGV0YWwsIG1vZGVsLCBmbG93ZXJJbmRleCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBwZXRhbC5hZGRFdmVudExpc3RlbmVyKCd0cmFja291dCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlsKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl91bmhvdmVyUGV0YWwocGV0YWwpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgUG9seW1lci5kb20ocGV0YWwpLmlubmVySFRNTCA9IG1vZGVsLmRpc3BsYXkgIT0gbnVsbCA/IG1vZGVsLmRpc3BsYXkobW9kZWwubW9kZWwpIDogbW9kZWwubW9kZWw7XG4gICAgICBpZiAobW9kZWwuaXNMZWFmKSB7XG4gICAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5jbGFzc0xpc3QuYWRkKCdsZWFmJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgnYnJhbmNoJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcblxuICAgIH1cbiAgICByZXR1cm4gcGV0YWw7XG4gIH0sXG4gIF9zcGF3bkZsb3dlcjogZnVuY3Rpb24ob3JpZ2luLCBwZXRhbHMsIGJhY2tQZXRhbFBvaW50KSB7XG4gICAgdmFyIGFuZ2xlT2Zmc2V0LCBmbG93ZXIsIG9mZnNldEZsb3dlciwgb2Zmc2V0UGlzdGlsLCBwZXRhbEVsZW1lbnRzLCBwaXN0aWwsIHNwYXduaW5nRmxvd2VySW5kZXg7XG4gICAgc3Bhd25pbmdGbG93ZXJJbmRleCA9IHRoaXMuX2Zsb3dlcnMubGVuZ3RoO1xuICAgIGZsb3dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZsb3dlci5pZCA9IFwiZmxvd2VyXCIgKyBzcGF3bmluZ0Zsb3dlckluZGV4O1xuICAgIFBvbHltZXIuZG9tKGZsb3dlcikuY2xhc3NMaXN0LmFkZCgnZmxvd2VyJyk7XG4gICAgUG9seW1lci5kb20odGhpcy4kWydwaWNrZXItY29udGFpbmVyJ10pLmFwcGVuZENoaWxkKGZsb3dlcik7XG4gICAgcGlzdGlsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGlzdGlsLmlkID0gXCJwaXN0aWxcIiArIHNwYXduaW5nRmxvd2VySW5kZXg7XG4gICAgUG9seW1lci5kb20ocGlzdGlsKS5jbGFzc0xpc3QuYWRkKCdwaXN0aWwnKTtcbiAgICBQb2x5bWVyLmRvbShwaXN0aWwpLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbCcpO1xuICAgIFBvbHltZXIuZG9tKGZsb3dlcikuYXBwZW5kQ2hpbGQocGlzdGlsKTtcbiAgICBvZmZzZXRGbG93ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVmdCwgcmVmLCB0b3A7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChvcmlnaW4sIGZsb3dlciksIHRvcCA9IHJlZi50b3AsIGxlZnQgPSByZWYubGVmdDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHRvQ3NzRmlndXJlKGxlZnQpLFxuICAgICAgICB0b3A6IHRvQ3NzRmlndXJlKHRvcClcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgICB0aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArIG9mZnNldEZsb3dlci5sZWZ0ICsgXCJweCwgXCIgKyBvZmZzZXRGbG93ZXIudG9wICsgXCJweClcIiwgZmxvd2VyKTtcbiAgICBvZmZzZXRQaXN0aWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmxvd2VyQ2VudGVyLCBsZWZ0LCByZWYsIHRvcDtcbiAgICAgIGZsb3dlckNlbnRlciA9IGVsZW1lbnRDZW50ZXJQb3NpdGlvbihmbG93ZXIsIGZsb3dlcik7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChmbG93ZXJDZW50ZXIsIHBpc3RpbCksIHRvcCA9IHJlZi50b3AsIGxlZnQgPSByZWYubGVmdDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHRvQ3NzRmlndXJlKGxlZnQpLFxuICAgICAgICB0b3A6IHRvQ3NzRmlndXJlKHRvcClcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgICB0aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArIG9mZnNldFBpc3RpbC5sZWZ0ICsgXCJweCwgXCIgKyBvZmZzZXRQaXN0aWwudG9wICsgXCJweClcIiwgcGlzdGlsKTtcbiAgICBwaXN0aWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2tvdmVyJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5faG92ZXJQaXN0aWwoc3Bhd25pbmdGbG93ZXJJbmRleCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICBpZiAodGhpcy5fZmxvd2Vycy5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuX2RlYWN0aXZhdGVGbG93ZXIodGhpcy5fZmxvd2Vyc1t0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDFdKTtcbiAgICB9XG4gICAgYW5nbGVPZmZzZXQgPSAoTWF0aC5QSSAvICgyICogcGV0YWxzLmxlbmd0aCkpICsgTWF0aC5QSTtcbiAgICBwZXRhbEVsZW1lbnRzID0gcGV0YWxzLm1hcCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbG0sIGlkeCkge1xuICAgICAgICB2YXIgY2VudGVyLCBjdXJyZW50Qm91bmRzLCBvZmZzZXRQZXRhbCwgcGV0YWwsIHBvdGVudGlhbFJlY3Q7XG4gICAgICAgIHBldGFsID0gX3RoaXMuX2NyZWF0ZVBldGFsRWxlbWVudChlbG0sIHNwYXduaW5nRmxvd2VySW5kZXgpO1xuICAgICAgICBQb2x5bWVyLmRvbShmbG93ZXIpLmFwcGVuZENoaWxkKHBldGFsKTtcbiAgICAgICAgY2VudGVyID0gcG9sVG9DYXIoTWF0aC5QSSAqIGlkeCAvIHBldGFscy5sZW5ndGggKyBhbmdsZU9mZnNldCwgX3RoaXMucmFkaXVzKTtcbiAgICAgICAgb2Zmc2V0UGV0YWwgPSBjZW50ZXJUb09mZnNldChjZW50ZXIsIHBldGFsKTtcbiAgICAgICAgcG90ZW50aWFsUmVjdCA9IHJlY3RGcm9tT2Zmc2V0KHBldGFsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB7XG4gICAgICAgICAgeDogb2Zmc2V0UGV0YWwubGVmdCxcbiAgICAgICAgICB5OiBvZmZzZXRQZXRhbC50b3BcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJlbnRCb3VuZHMgPSBfdGhpcy5fY29udGFpbmVyKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGlmICghKGNoZWNrQ29udGFpbm1lbnQocG90ZW50aWFsUmVjdCwgY3VycmVudEJvdW5kcykpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBjb250YWluZWQ6ICcsIHBldGFsLCBjdXJyZW50Qm91bmRzKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy50cmFuc2Zvcm0oXCJ0cmFuc2xhdGUoXCIgKyAodG9Dc3NGaWd1cmUob2Zmc2V0UGV0YWwubGVmdCkpICsgXCJweCwgXCIgKyAodG9Dc3NGaWd1cmUob2Zmc2V0UGV0YWwudG9wKSkgKyBcInB4KVwiLCBwZXRhbCk7XG4gICAgICAgIHJldHVybiBwZXRhbDtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLl9mbG93ZXJzLnB1c2goe1xuICAgICAgZWxlbWVudDogZmxvd2VyLFxuICAgICAgb3JpZ2luOiBvcmlnaW5cbiAgICB9KTtcbiAgfSxcbiAgX2RlYWN0aXZhdGVGbG93ZXI6IGZ1bmN0aW9uKGZsb3dlcikge1xuICAgIHJldHVybiBQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkuY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygncGV0YWwnKSkge1xuICAgICAgICByZXR1cm4gUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUtcGV0YWwnKTtcbiAgICAgIH0gZWxzZSBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Zsb3dlcicpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZS1mbG93ZXInKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2FjdGl2YXRlRmxvd2VyOiBmdW5jdGlvbihmbG93ZXIpIHtcbiAgICByZXR1cm4gUG9seW1lci5kb20oZmxvd2VyLmVsZW1lbnQpLmNoaWxkTm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BldGFsJykpIHtcbiAgICAgICAgUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUtcGV0YWwnKTtcbiAgICAgICAgaWYgKG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdvdmVyLWJyYW5jaCcpKSB7XG4gICAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXItYnJhbmNoJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2Zsb3dlcicpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZS1mbG93ZXInKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3BvcEZsb3dlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZsb3dlciwgZmxvd2VyUGFyZW50O1xuICAgIGlmICh0aGlzLl9mbG93ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZsb3dlciA9IHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXTtcbiAgICAgIGZsb3dlclBhcmVudCA9IFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5wYXJlbnROb2RlO1xuICAgICAgUG9seW1lci5kb20oZmxvd2VyUGFyZW50KS5yZW1vdmVDaGlsZChmbG93ZXIuZWxlbWVudCk7XG4gICAgICB0aGlzLl9mbG93ZXJzLnNwbGljZSh0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgaWYgKHRoaXMuX2Zsb3dlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmF0ZUZsb3dlcih0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2NyZWF0ZUxpbmtFbGVtZW50RnJvbTogZnVuY3Rpb24oZnJvbUZsb3dlckluZGV4KSB7XG4gICAgdmFyIGFuZ2xlLCBkc3QsIGxpbmtFbG0sIHNyYztcbiAgICBpZiAoKHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSkgPiAoZnJvbUZsb3dlckluZGV4ICsgMSkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIGZsb3dlcnMgdG8gbWFrZSB0aGF0IGxpbmshJyk7XG4gICAgfVxuICAgIHNyYyA9IHRoaXMuX2Zsb3dlcnNbZnJvbUZsb3dlckluZGV4XTtcbiAgICBkc3QgPSB0aGlzLl9mbG93ZXJzW2Zyb21GbG93ZXJJbmRleCArIDFdO1xuICAgIGFuZ2xlID0gLU1hdGguYWNvcygoZHN0Lm9yaWdpbi54IC0gc3JjLm9yaWdpbi54KSAvIHRoaXMucmFkaXVzKTtcbiAgICBsaW5rRWxtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgUG9seW1lci5kb20odGhpcy5fY29udGFpbmVyKCkpLmFwcGVuZENoaWxkKGxpbmtFbG0pO1xuICAgIFBvbHltZXIuZG9tKGxpbmtFbG0pLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbC1saW5rJyk7XG4gICAgbGlua0VsbS5zdHlsZVsncG9zaXRpb24nXSA9ICdhYnNvbHV0ZSc7XG4gICAgbGlua0VsbS5zdHlsZVsnd2lkdGgnXSA9IHRoaXMucmFkaXVzICsgXCJweFwiO1xuICAgIGxpbmtFbG0uc3R5bGVbJ2hlaWdodCddID0gJzVweCc7XG4gICAgbGlua0VsbS5zdHlsZVsndHJhbnNmb3JtJ10gPSBcInJvdGF0ZShcIiArIGFuZ2xlICsgXCJyYWQpXCI7XG4gICAgbGlua0VsbS5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJyNmYWEnO1xuICAgIGxpbmtFbG0uc3R5bGVbJ2xlZnQnXSA9IHNyYy5vcmlnaW4ueCArICdweCc7XG4gICAgbGlua0VsbS5zdHlsZVsndG9wJ10gPSBzcmMub3JpZ2luLnkgKyAncHgnO1xuICAgIHJldHVybiBsaW5rRWxtLnN0eWxlWyd0cmFuc2Zvcm0tb3JpZ2luJ10gPSAnY2VudGVyIGxlZnQnO1xuICB9LFxuICBfaG92ZXJQZXRhbDogZnVuY3Rpb24ocGV0YWxFbGVtZW50LCBwZXRhbE1vZGVsLCBmbG93ZXJJbmRleCkge1xuICAgIHZhciBjdXJyRmxvd2VyRWxtLCBlbGVtZW50Q2VudGVyO1xuICAgIGlmICh0aGlzLl9vdmVyUGV0YWwgPT09IHBldGFsTW9kZWwpIHtcblxuICAgIH0gZWxzZSBpZiAoZmxvd2VySW5kZXggPT09ICh0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBwZXRhbEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3Zlci1wZXRhbCcpO1xuICAgICAgdGhpcy5fb3ZlclBldGFsID0gcGV0YWxNb2RlbDtcbiAgICAgIGVsZW1lbnRDZW50ZXIgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaWVsZFJlY3QsIHBldGFsUmVjdDtcbiAgICAgICAgICBwZXRhbFJlY3QgPSBwZXRhbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgZmllbGRSZWN0ID0gX3RoaXMuX2NvbnRhaW5lcigpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwZXRhbFJlY3QubGVmdCAtIGZpZWxkUmVjdC5sZWZ0ICsgKHBldGFsUmVjdC53aWR0aCAvIDIpLFxuICAgICAgICAgICAgeTogcGV0YWxSZWN0LnRvcCAtIGZpZWxkUmVjdC50b3AgKyAocGV0YWxSZWN0LmhlaWdodCAvIDIpXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKCk7XG4gICAgICBpZiAoIXRoaXMuX292ZXJQZXRhbC5pc0xlYWYpIHtcbiAgICAgICAgUG9seW1lci5kb20ocGV0YWxFbGVtZW50KS5jbGFzc0xpc3QuYWRkKCdvdmVyLWJyYW5jaCcpO1xuICAgICAgICBjdXJyRmxvd2VyRWxtID0gdGhpcy5fZmxvd2Vyc1t0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDFdLmVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9zcGF3bkZsb3dlcihlbGVtZW50Q2VudGVyLCB0aGlzLl9vdmVyUGV0YWwuY2hpbGRyZW4sIGVsZW1lbnRDZW50ZXJQb3NpdGlvbihjdXJyRmxvd2VyRWxtLCB0aGlzLl9jb250YWluZXIoKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX3VuaG92ZXJQZXRhbDogZnVuY3Rpb24ocGV0YWxFbGVtZW50KSB7XG4gICAgcGV0YWxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXItcGV0YWwnKTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlclBldGFsID0gbnVsbDtcbiAgfSxcbiAgX2hvdmVyUGlzdGlsOiBmdW5jdGlvbihkZXB0aCkge1xuICAgIHZhciBpLCBqLCByZWYsIHJlZjEsIHJlc3VsdHM7XG4gICAgaWYgKGRlcHRoID49IHRoaXMuX2Zsb3dlcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJob3ZlcmluZyBvdmVyIHBpc3RpbCBvZiBkZXB0aCBcIiArIGRlcHRoICsgXCIsIGJ1dCB0aGUgZmxvd2VyIHN0YWNrIGlzIG9ubHkgXCIgKyB0aGlzLl9mbG93ZXJzLmxlbmd0aCArIFwiIGRlZXAuXCIpO1xuICAgIH0gZWxzZSBpZiAoZGVwdGggIT09IHRoaXMuX2Zsb3dlcnMubGVuZ3RoKSB7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBqID0gcmVmID0gdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxLCByZWYxID0gZGVwdGggKyAxOyBqID49IHJlZjE7IGkgPSBqICs9IC0xKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wb3BGbG93ZXIoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH0sXG4gIF91bmhvdmVyUGlzdGlsOiBmdW5jdGlvbihpbmRleCkge30sXG4gIF9oYW5kbGVEb3duOiBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgZGV0YWlsLCBmaWVsZFJlY3Q7XG4gICAgZGV0YWlsID0gYXJnLmRldGFpbDtcbiAgICBmaWVsZFJlY3QgPSB0aGlzLl9jb250YWluZXIoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydCh7XG4gICAgICB4OiBkZXRhaWwueCAtIGZpZWxkUmVjdC5sZWZ0LFxuICAgICAgeTogZGV0YWlsLnkgLSBmaWVsZFJlY3QudG9wXG4gICAgfSk7XG4gIH0sXG4gIF9oYW5kbGVVcDogZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIGRldGFpbCwgZmllbGRSZWN0O1xuICAgIGRldGFpbCA9IGFyZy5kZXRhaWw7XG4gICAgZmllbGRSZWN0ID0gdGhpcy5fY29udGFpbmVyKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoKHtcbiAgICAgIHg6IGRldGFpbC54IC0gZmllbGRSZWN0LmxlZnQsXG4gICAgICB5OiBkZXRhaWwueSAtIGZpZWxkUmVjdC50b3BcbiAgICB9KTtcbiAgfSxcbiAgX2xhc3RIb3ZlcjogbnVsbCxcbiAgX2hhbmRsZVRyYWNrOiBmdW5jdGlvbihldnQsIGRldGFpbCkge1xuICAgIHZhciBob3ZlcjtcbiAgICBob3ZlciA9IGRldGFpbC5ob3ZlcigpO1xuICAgIHRoaXMuZmlyZSgndHJhY2tvdmVyJywgZGV0YWlsLCB7XG4gICAgICBub2RlOiBob3ZlclxuICAgIH0pO1xuICAgIGlmIChob3ZlciAhPT0gdGhpcy5fbGFzdEhvdmVyKSB7XG4gICAgICB0aGlzLmZpcmUoJ3RyYWNrb3V0JywgZGV0YWlsLCB7XG4gICAgICAgIG5vZGU6IHRoaXMuX2xhc3RIb3ZlclxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5fbGFzdEhvdmVyID0gaG92ZXI7XG4gICAgfVxuICB9XG59KTtcbiJdfQ==
