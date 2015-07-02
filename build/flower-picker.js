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
    'down': '_handleDown',
    'up': '_handleUp',
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
        offsetPetal = (function() {
          return centerToOffset(center, petal);
        })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9ndWxwLWNvZmZlZWlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZmxvd2VyLXBpY2tlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUV09fUEksIGNlbnRlclRvT2Zmc2V0LCBjaGVja0NvbnRhaW5tZW50LCBlbGVtZW50Q2VudGVyUG9zaXRpb24sIHBvbFRvQ2FyLCByZWN0RnJvbU9mZnNldCwgdG9Dc3NGaWd1cmU7XG5cbnBvbFRvQ2FyID0gZnVuY3Rpb24oYW5nbGUsIHJhZGl1cykge1xuICByZXR1cm4ge1xuICAgIHg6IHJhZGl1cyAqIChNYXRoLmNvcyhhbmdsZSkpLFxuICAgIHk6IHJhZGl1cyAqIChNYXRoLnNpbihhbmdsZSkpXG4gIH07XG59O1xuXG5jZW50ZXJUb09mZnNldCA9IGZ1bmN0aW9uKGFyZywgZWxlbWVudCkge1xuICB2YXIgcmVjdCwgeCwgeTtcbiAgeCA9IGFyZy54LCB5ID0gYXJnLnk7XG4gIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHRvcDogeSAtIChyZWN0LmhlaWdodCAvIDIpLFxuICAgIGxlZnQ6IHggLSAocmVjdC53aWR0aCAvIDIpXG4gIH07XG59O1xuXG5lbGVtZW50Q2VudGVyUG9zaXRpb24gPSBmdW5jdGlvbihlbGVtZW50LCByZWxhdGl2ZVRvKSB7XG4gIHZhciBlbG1Cb3VuZHMsIHJlbEJvdW5kcztcbiAgZWxtQm91bmRzID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmVsQm91bmRzID0gcmVsYXRpdmVUby5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB4OiBlbG1Cb3VuZHMubGVmdCAtIHJlbEJvdW5kcy5sZWZ0ICsgKGVsbUJvdW5kcy53aWR0aCAvIDIpLFxuICAgIHk6IGVsbUJvdW5kcy50b3AgLSByZWxCb3VuZHMudG9wICsgKGVsbUJvdW5kcy5oZWlnaHQgLyAyKVxuICB9O1xufTtcblxuY2hlY2tDb250YWlubWVudCA9IGZ1bmN0aW9uKHN1YlJlY3QsIGluUmVjdCkge1xuICByZXR1cm4gKHN1YlJlY3QubGVmdCA+PSBpblJlY3QubGVmdCkgJiYgKHN1YlJlY3QudG9wID49IGluUmVjdC50b3ApICYmIChzdWJSZWN0LnJpZ2h0IDw9IGluUmVjdC5yaWdodCkgJiYgKHN1YlJlY3QuYm90dG9tIDw9IGluUmVjdC5ib3R0b20pO1xufTtcblxucmVjdEZyb21PZmZzZXQgPSBmdW5jdGlvbihiYXNlUmVjdCwgYXJnKSB7XG4gIHZhciByZXN1bHQsIHgsIHk7XG4gIHggPSBhcmcueCwgeSA9IGFyZy55O1xuICByZXN1bHQgPSB7XG4gICAgbGVmdDogeCArIGJhc2VSZWN0LmxlZnQsXG4gICAgdG9wOiB5ICsgYmFzZVJlY3QudG9wLFxuICAgIHdpZHRoOiBiYXNlUmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IGJhc2VSZWN0LmhlaWdodFxuICB9O1xuICByZXN1bHRbJ3JpZ2h0J10gPSByZXN1bHQubGVmdCArIHJlc3VsdC53aWR0aDtcbiAgcmVzdWx0Wydib3R0b20nXSA9IHJlc3VsdC50b3AgKyByZXN1bHQuaGVpZ2h0O1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVFdPX1BJID0gTWF0aC5QSSAqIDI7XG5cbnRvQ3NzRmlndXJlID0gZnVuY3Rpb24obnVtKSB7XG4gIHJldHVybiBudW0udG9QcmVjaXNpb24oOCk7XG59O1xuXG5Qb2x5bWVyKHtcbiAgaXM6ICdmbG93ZXItcGlja2VyJyxcbiAgcHJvcGVydGllczoge1xuICAgIHBldGFsczoge1xuICAgICAgdHlwZTogQXJyYXlcbiAgICB9LFxuICAgIHJhZGl1czoge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgdmFsdWU6IDgwXG4gICAgfVxuICB9LFxuICBsaXN0ZW5lcnM6IHtcbiAgICAnZG93bic6ICdfaGFuZGxlRG93bicsXG4gICAgJ3VwJzogJ19oYW5kbGVVcCcsXG4gICAgJ3RyYWNrJzogJ19oYW5kbGVUcmFjaydcbiAgfSxcbiAgc3RhcnQ6IGZ1bmN0aW9uKG9yaWdpbikge1xuICAgIHJldHVybiB0aGlzLl9zcGF3bkZsb3dlcihvcmlnaW4sIHRoaXMucGV0YWxzKTtcbiAgfSxcbiAgZmluaXNoOiBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gYXJnLngsIHkgPSBhcmcueTtcbiAgICBpZiAoKHRoaXMuX292ZXJQZXRhbCAhPSBudWxsKSAmJiB0aGlzLl9vdmVyUGV0YWwuaXNMZWFmKSB7XG4gICAgICB0aGlzLmZpcmUoJ3NlbGVjdGVkJywge1xuICAgICAgICBwZXRhbDogdGhpcy5fb3ZlclBldGFsLFxuICAgICAgICB2YWx1ZTogdGhpcy5fb3ZlclBldGFsLnZhbHVlICE9IG51bGwgPyB0aGlzLl9vdmVyUGV0YWwudmFsdWUodGhpcy5fb3ZlclBldGFsLm1vZGVsKSA6IHRoaXMuX292ZXJQZXRhbC5tb2RlbFxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2Zsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmbG93ZXIpIHtcbiAgICAgIHJldHVybiBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkucGFyZW50Tm9kZSkucmVtb3ZlQ2hpbGQoZmxvd2VyLmVsZW1lbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX2Zsb3dlcnMgPSBbXTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlclBldGFsID0gbnVsbDtcbiAgfSxcbiAgX2Zsb3dlcnM6IFtdLFxuICBfb3ZlclBldGFsOiBudWxsLFxuICBfY29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kWydwaWNrZXItY29udGFpbmVyJ107XG4gIH0sXG4gIF9jcmVhdGVQZXRhbEVsZW1lbnQ6IGZ1bmN0aW9uKG1vZGVsLCBmbG93ZXJJbmRleCkge1xuICAgIHZhciBwZXRhbDtcbiAgICBwZXRhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlmIChtb2RlbC5pc0JhY2tQZXRhbCA9PSBudWxsKSB7XG4gICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgncGV0YWwnKTtcbiAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5jbGFzc0xpc3QuYWRkKCd1bnNlbGVjdGFibGUnKTtcbiAgICAgIHBldGFsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrb3ZlcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlsKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9ob3ZlclBldGFsKHBldGFsLCBtb2RlbCwgZmxvd2VySW5kZXgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcGV0YWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2tvdXQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fdW5ob3ZlclBldGFsKHBldGFsKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIFBvbHltZXIuZG9tKHBldGFsKS5pbm5lckhUTUwgPSBtb2RlbC5kaXNwbGF5ICE9IG51bGwgPyBtb2RlbC5kaXNwbGF5KG1vZGVsLm1vZGVsKSA6IG1vZGVsLm1vZGVsO1xuICAgICAgaWYgKG1vZGVsLmlzTGVhZikge1xuICAgICAgICBQb2x5bWVyLmRvbShwZXRhbCkuY2xhc3NMaXN0LmFkZCgnbGVhZicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUG9seW1lci5kb20ocGV0YWwpLmNsYXNzTGlzdC5hZGQoJ2JyYW5jaCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICB9XG4gICAgcmV0dXJuIHBldGFsO1xuICB9LFxuICBfc3Bhd25GbG93ZXI6IGZ1bmN0aW9uKG9yaWdpbiwgcGV0YWxzLCBiYWNrUGV0YWxQb2ludCkge1xuICAgIHZhciBhbmdsZU9mZnNldCwgZmxvd2VyLCBvZmZzZXRGbG93ZXIsIG9mZnNldFBpc3RpbCwgcGV0YWxFbGVtZW50cywgcGlzdGlsLCBzcGF3bmluZ0Zsb3dlckluZGV4O1xuICAgIHNwYXduaW5nRmxvd2VySW5kZXggPSB0aGlzLl9mbG93ZXJzLmxlbmd0aDtcbiAgICBmbG93ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBQb2x5bWVyLmRvbShmbG93ZXIpLnNldEF0dHJpYnV0ZSgnaWQnLCBcImZsb3dlclwiICsgc3Bhd25pbmdGbG93ZXJJbmRleCk7XG4gICAgUG9seW1lci5kb20oZmxvd2VyKS5jbGFzc0xpc3QuYWRkKCdmbG93ZXInKTtcbiAgICBQb2x5bWVyLmRvbSh0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXSkuYXBwZW5kQ2hpbGQoZmxvd2VyKTtcbiAgICBwaXN0aWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBQb2x5bWVyLmRvbShwaXN0aWwpLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbCcpO1xuICAgIFBvbHltZXIuZG9tKHBpc3RpbCkuY2xhc3NMaXN0LmFkZCgndW5zZWxlY3RhYmxlJyk7XG4gICAgUG9seW1lci5kb20ocGlzdGlsKS5zZXRBdHRyaWJ1dGUoJ2lkJywgXCJwaXN0aWxcIiArIHNwYXduaW5nRmxvd2VySW5kZXgpO1xuICAgIFBvbHltZXIuZG9tKGZsb3dlcikuYXBwZW5kQ2hpbGQocGlzdGlsKTtcbiAgICBvZmZzZXRGbG93ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVmdCwgcmVmLCB0b3A7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChvcmlnaW4sIGZsb3dlciksIHRvcCA9IHJlZi50b3AsIGxlZnQgPSByZWYubGVmdDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHRvQ3NzRmlndXJlKGxlZnQpLFxuICAgICAgICB0b3A6IHRvQ3NzRmlndXJlKHRvcClcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgICB0aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArIG9mZnNldEZsb3dlci5sZWZ0ICsgXCJweCwgXCIgKyBvZmZzZXRGbG93ZXIudG9wICsgXCJweClcIiwgZmxvd2VyKTtcbiAgICBvZmZzZXRQaXN0aWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVmdCwgcmVmLCB0b3A7XG4gICAgICByZWYgPSBjZW50ZXJUb09mZnNldChlbGVtZW50Q2VudGVyUG9zaXRpb24oZmxvd2VyLCBmbG93ZXIpLCBwaXN0aWwpLCB0b3AgPSByZWYudG9wLCBsZWZ0ID0gcmVmLmxlZnQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiB0b0Nzc0ZpZ3VyZShsZWZ0KSxcbiAgICAgICAgdG9wOiB0b0Nzc0ZpZ3VyZSh0b3ApXG4gICAgICB9O1xuICAgIH0pKCk7XG4gICAgdGhpcy50cmFuc2Zvcm0oXCJ0cmFuc2xhdGUoXCIgKyBvZmZzZXRQaXN0aWwubGVmdCArIFwicHgsIFwiICsgb2Zmc2V0UGlzdGlsLnRvcCArIFwicHgpXCIsIHBpc3RpbCk7XG4gICAgcGlzdGlsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrb3ZlcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuX2hvdmVyUGlzdGlsKHNwYXduaW5nRmxvd2VySW5kZXgpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgaWYgKHRoaXMuX2Zsb3dlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlRmxvd2VyKHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXSk7XG4gICAgfVxuICAgIGFuZ2xlT2Zmc2V0ID0gKE1hdGguUEkgLyAoMiAqIHBldGFscy5sZW5ndGgpKSArIE1hdGguUEk7XG4gICAgcGV0YWxFbGVtZW50cyA9IHBldGFscy5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWxtLCBpZHgpIHtcbiAgICAgICAgdmFyIGNlbnRlciwgb2Zmc2V0UGV0YWwsIHBldGFsLCBwb3RlbnRpYWxSZWN0O1xuICAgICAgICBwZXRhbCA9IF90aGlzLl9jcmVhdGVQZXRhbEVsZW1lbnQoZWxtLCBzcGF3bmluZ0Zsb3dlckluZGV4KTtcbiAgICAgICAgUG9seW1lci5kb20oZmxvd2VyKS5hcHBlbmRDaGlsZChwZXRhbCk7XG4gICAgICAgIGNlbnRlciA9IHBvbFRvQ2FyKE1hdGguUEkgKiBpZHggLyBwZXRhbHMubGVuZ3RoICsgYW5nbGVPZmZzZXQsIF90aGlzLnJhZGl1cyk7XG4gICAgICAgIG9mZnNldFBldGFsID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBjZW50ZXJUb09mZnNldChjZW50ZXIsIHBldGFsKTtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgcG90ZW50aWFsUmVjdCA9IHJlY3RGcm9tT2Zmc2V0KHBldGFsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB7XG4gICAgICAgICAgeDogb2Zmc2V0UGV0YWwubGVmdCxcbiAgICAgICAgICB5OiBvZmZzZXRQZXRhbC50b3BcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghKGNoZWNrQ29udGFpbm1lbnQocG90ZW50aWFsUmVjdCwgX3RoaXMuX2NvbnRhaW5lcigpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGNvbnRhaW5lZDogJywgcGV0YWwpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLnRyYW5zZm9ybShcInRyYW5zbGF0ZShcIiArICh0b0Nzc0ZpZ3VyZShvZmZzZXRQZXRhbC5sZWZ0KSkgKyBcInB4LCBcIiArICh0b0Nzc0ZpZ3VyZShvZmZzZXRQZXRhbC50b3ApKSArIFwicHgpXCIsIHBldGFsKTtcbiAgICAgICAgcmV0dXJuIHBldGFsO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMuX2Zsb3dlcnMucHVzaCh7XG4gICAgICBlbGVtZW50OiBmbG93ZXIsXG4gICAgICBvcmlnaW46IG9yaWdpblxuICAgIH0pO1xuICB9LFxuICBfZGVhY3RpdmF0ZUZsb3dlcjogZnVuY3Rpb24oZmxvd2VyKSB7XG4gICAgcmV0dXJuIFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5jaGlsZE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdwZXRhbCcpKSB7XG4gICAgICAgIHJldHVybiBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZS1wZXRhbCcpO1xuICAgICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnZmxvd2VyJykpIHtcbiAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlLWZsb3dlcicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWN0aXZhdGVGbG93ZXI6IGZ1bmN0aW9uKGZsb3dlcikge1xuICAgIHJldHVybiBQb2x5bWVyLmRvbShmbG93ZXIuZWxlbWVudCkuY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygncGV0YWwnKSkge1xuICAgICAgICBQb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZS1wZXRhbCcpO1xuICAgICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ292ZXItYnJhbmNoJykpIHtcbiAgICAgICAgICByZXR1cm4gUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LnJlbW92ZSgnb3Zlci1icmFuY2gnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnZmxvd2VyJykpIHtcbiAgICAgICAgcmV0dXJuIFBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlLWZsb3dlcicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcG9wRmxvd2VyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmxvd2VyO1xuICAgIGlmICh0aGlzLl9mbG93ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZsb3dlciA9IHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXTtcbiAgICAgIFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKGZsb3dlci5lbGVtZW50KS5wYXJlbnROb2RlKS5yZW1vdmVDaGlsZChmbG93ZXIuZWxlbWVudCk7XG4gICAgICB0aGlzLl9mbG93ZXJzLnNwbGljZSh0aGlzLl9mbG93ZXJzLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgaWYgKHRoaXMuX2Zsb3dlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmF0ZUZsb3dlcih0aGlzLl9mbG93ZXJzW3RoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMV0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2NyZWF0ZUxpbmtFbGVtZW50RnJvbTogZnVuY3Rpb24oZnJvbUZsb3dlckluZGV4KSB7XG4gICAgdmFyIGFuZ2xlLCBkc3QsIGxpbmtFbG0sIHNyYztcbiAgICBpZiAoKHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSkgPiAoZnJvbUZsb3dlckluZGV4ICsgMSkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIGZsb3dlcnMgdG8gbWFrZSB0aGF0IGxpbmshJyk7XG4gICAgfVxuICAgIHNyYyA9IHRoaXMuX2Zsb3dlcnNbZnJvbUZsb3dlckluZGV4XTtcbiAgICBkc3QgPSB0aGlzLl9mbG93ZXJzW2Zyb21GbG93ZXJJbmRleCArIDFdO1xuICAgIGFuZ2xlID0gLU1hdGguYWNvcygoZHN0Lm9yaWdpbi54IC0gc3JjLm9yaWdpbi54KSAvIHRoaXMucmFkaXVzKTtcbiAgICBsaW5rRWxtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgUG9seW1lci5kb20odGhpcy5fY29udGFpbmVyKCkpLmFwcGVuZENoaWxkKGxpbmtFbG0pO1xuICAgIFBvbHltZXIuZG9tKGxpbmtFbG0pLmNsYXNzTGlzdC5hZGQoJ3Bpc3RpbC1saW5rJyk7XG4gICAgbGlua0VsbS5zdHlsZVsncG9zaXRpb24nXSA9ICdhYnNvbHV0ZSc7XG4gICAgbGlua0VsbS5zdHlsZVsnd2lkdGgnXSA9IHRoaXMucmFkaXVzICsgXCJweFwiO1xuICAgIGxpbmtFbG0uc3R5bGVbJ2jDn2VpZ2h0J10gPSAnNXB4JztcbiAgICBsaW5rRWxtLnN0eWxlWyd0cmFuc2Zvcm0nXSA9IFwicm90YXRlKFwiICsgYW5nbGUgKyBcInJhZClcIjtcbiAgICBsaW5rRWxtLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnI2ZhYSc7XG4gICAgbGlua0VsbS5zdHlsZVsnbGVmdCddID0gc3JjLm9yaWdpbi54ICsgJ3B4JztcbiAgICBsaW5rRWxtLnN0eWxlWyd0b3AnXSA9IHNyYy5vcmlnaW4ueSArICdweCc7XG4gICAgcmV0dXJuIGxpbmtFbG0uc3R5bGVbJ3RyYW5zZm9ybS1vcmlnaW4nXSA9ICdjZW50ZXIgbGVmdCc7XG4gIH0sXG4gIF9ob3ZlclBldGFsOiBmdW5jdGlvbihwZXRhbEVsZW1lbnQsIHBldGFsTW9kZWwsIGZsb3dlckluZGV4KSB7XG4gICAgdmFyIGVsZW1lbnRDZW50ZXI7XG4gICAgaWYgKHRoaXMuX292ZXJQZXRhbCA9PT0gcGV0YWxNb2RlbCkge1xuXG4gICAgfSBlbHNlIGlmIChmbG93ZXJJbmRleCA9PT0gKHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIHBldGFsRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvdmVyLXBldGFsJyk7XG4gICAgICB0aGlzLl9vdmVyUGV0YWwgPSBwZXRhbE1vZGVsO1xuICAgICAgZWxlbWVudENlbnRlciA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpZWxkUmVjdCwgcGV0YWxSZWN0O1xuICAgICAgICAgIHBldGFsUmVjdCA9IHBldGFsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBmaWVsZFJlY3QgPSBfdGhpcy4kWydwaWNrZXItY29udGFpbmVyJ10uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHBldGFsUmVjdC5sZWZ0IC0gZmllbGRSZWN0LmxlZnQgKyAocGV0YWxSZWN0LndpZHRoIC8gMiksXG4gICAgICAgICAgICB5OiBwZXRhbFJlY3QudG9wIC0gZmllbGRSZWN0LnRvcCArIChwZXRhbFJlY3QuaGVpZ2h0IC8gMilcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykoKTtcbiAgICAgIGlmICghdGhpcy5fb3ZlclBldGFsLmlzTGVhZikge1xuICAgICAgICBQb2x5bWVyLmRvbShwZXRhbEVsZW1lbnQpLmNsYXNzTGlzdC5hZGQoJ292ZXItYnJhbmNoJyk7XG4gICAgICAgIHRoaXMuX3NwYXduRmxvd2VyKGVsZW1lbnRDZW50ZXIsIHRoaXMuX292ZXJQZXRhbC5jaGlsZHJlbiwgZWxlbWVudENlbnRlclBvc2l0aW9uKHRoaXMuX2Zsb3dlcnNbdGhpcy5fZmxvd2Vycy5sZW5ndGggLSAxXS5lbGVtZW50LCB0aGlzLiRbJ3BpY2tlci1jb250YWluZXInXSkpO1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlTGlua0VsZW1lbnRGcm9tKGZsb3dlckluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF91bmhvdmVyUGV0YWw6IGZ1bmN0aW9uKHBldGFsRWxlbWVudCkge1xuICAgIHBldGFsRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyLXBldGFsJyk7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJQZXRhbCA9IG51bGw7XG4gIH0sXG4gIF9ob3ZlclBpc3RpbDogZnVuY3Rpb24oZGVwdGgpIHtcbiAgICB2YXIgaSwgaiwgcmVmLCByZWYxLCByZXN1bHRzO1xuICAgIGlmIChkZXB0aCA+PSB0aGlzLl9mbG93ZXJzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiaG92ZXJpbmcgb3ZlciBwaXN0aWwgb2YgZGVwdGggXCIgKyBkZXB0aCArIFwiLCBidXQgdGhlIGZsb3dlciBzdGFjayBpcyBvbmx5IFwiICsgdGhpcy5fZmxvd2Vycy5sZW5ndGggKyBcIiBkZWVwLlwiKTtcbiAgICB9IGVsc2UgaWYgKGRlcHRoICE9PSB0aGlzLl9mbG93ZXJzLmxlbmd0aCkge1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gaiA9IHJlZiA9IHRoaXMuX2Zsb3dlcnMubGVuZ3RoIC0gMSwgcmVmMSA9IGRlcHRoICsgMTsgaiA+PSByZWYxOyBpID0gaiArPSAtMSkge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5fcG9wRmxvd2VyKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICB9LFxuICBfdW5ob3ZlclBpc3RpbDogZnVuY3Rpb24oaW5kZXgpIHt9LFxuICBfaGFuZGxlRG93bjogZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIGRldGFpbCwgZmllbGRSZWN0O1xuICAgIGRldGFpbCA9IGFyZy5kZXRhaWw7XG4gICAgZmllbGRSZWN0ID0gdGhpcy4kWydwaWNrZXItY29udGFpbmVyJ10uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnQoe1xuICAgICAgeDogZGV0YWlsLnggLSBmaWVsZFJlY3QubGVmdCxcbiAgICAgIHk6IGRldGFpbC55IC0gZmllbGRSZWN0LnRvcFxuICAgIH0pO1xuICB9LFxuICBfaGFuZGxlVXA6IGZ1bmN0aW9uKGFyZykge1xuICAgIHZhciBkZXRhaWwsIGZpZWxkUmVjdDtcbiAgICBkZXRhaWwgPSBhcmcuZGV0YWlsO1xuICAgIGZpZWxkUmVjdCA9IHRoaXMuJFsncGlja2VyLWNvbnRhaW5lciddLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaCh7XG4gICAgICB4OiBkZXRhaWwueCAtIGZpZWxkUmVjdC5sZWZ0LFxuICAgICAgeTogZGV0YWlsLnkgLSBmaWVsZFJlY3QudG9wXG4gICAgfSk7XG4gIH0sXG4gIF9sYXN0SG92ZXI6IG51bGwsXG4gIF9oYW5kbGVUcmFjazogZnVuY3Rpb24oZXZ0LCBkZXRhaWwpIHtcbiAgICB2YXIgaG92ZXI7XG4gICAgaG92ZXIgPSBkZXRhaWwuaG92ZXIoKTtcbiAgICB0aGlzLmZpcmUoJ3RyYWNrb3ZlcicsIGRldGFpbCwge1xuICAgICAgbm9kZTogaG92ZXJcbiAgICB9KTtcbiAgICBpZiAoaG92ZXIgIT09IHRoaXMuX2xhc3RIb3Zlcikge1xuICAgICAgdGhpcy5maXJlKCd0cmFja291dCcsIGRldGFpbCwge1xuICAgICAgICBub2RlOiB0aGlzLl9sYXN0SG92ZXJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuX2xhc3RIb3ZlciA9IGhvdmVyO1xuICAgIH1cbiAgfVxufSk7XG4iXX0=
