/**
 * Liquid SVG Button
 * Author: Edgar Bermejo
 * Version: 0.1.0 Beta
 *
 * MIT License
 *
 * Copyright (c) 2017 Edgar Bermejo
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LiquidButton = function () {
  function LiquidButton(btn) {
    _classCallCheck(this, LiquidButton);

    this.btn = btn;
    this.pathDef = '';
    this.padding = parseFloat(this.btn.dataset.padding) || 20;
    this.margin = 1;
    this.gap = 1;
    this.rect = this.btn.getBoundingClientRect();
    this.r = (this.rect.height - this.padding) * 0.5;
    this.width = this.rect.width - this.padding * 2;
    this.height = this.rect.height - this.padding * 2;
    this.touches = [];
    this.tension = 0.4;
    this.hoverFactor = -0.1;
    this.forceFactor = 0.2;
    var colors = this.btn.dataset.gradient.split(',');
    this.stop = 0;
    this.colorStops = [{ offset: this.stop + '%', 'stop-color': colors[0] }, { offset: this.stop + 50 + '%', 'stop-color': colors[1] }];
    this.layers = [{ points: [], viscosity: 0.7, mouseForce: 1200, forceLimit: 2 }, { points: [], viscosity: 0.5, mouseForce: 900, forceLimit: 3 }];

    this.createPaths();
    this.createPlaceholder();
    this.createBackgrounds();
    this.points = this.calculateAreaPoints();
    this.createButton(btn);

    this.btn.addEventListener('mouseover', this.mouseover, false);
    this.btn.addEventListener('mouseout', this.mouseout, false);
    this.btn.addEventListener('click', this.click, false);
    window.addEventListener('resize', this.resize.bind(this), false);

    this.resize();
    this.animate();
  }

  /**
   * @description Creates the SVG paths
   */


  _createClass(LiquidButton, [{
    key: 'createPaths',
    value: function createPaths() {
      this.svg = this.btn.querySelector('svg');
      this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.svg.appendChild(this.path2);
      this.svg.appendChild(this.path);
    }

    /**
     * @description Creates the SVG text
     */

  }, {
    key: 'createPlaceholder',
    value: function createPlaceholder() {
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = this.btn.dataset.placeholder || '';
      text.setAttribute('x', '50%');
      text.setAttribute('y', '50%');
      text.setAttribute('dy', '0.2em');
      text.setAttribute('style', this.btn.dataset.textstyle || 'fill: white;');
      text.setAttribute('alignment-baseline', 'middle');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('pointer-events', 'none');
      this.svg.appendChild(text);
    }

    /**
     * @description Creates the SVG backgrounds
     */

  }, {
    key: 'createBackgrounds',
    value: function createBackgrounds() {
      this.gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      var _id = this.udid + '-gradient';
      this.gradient.setAttribute('id', _id);
      this.gradient.setAttribute('gradientTransform', 'rotate(35)');
      for (var i = 0; i < this.colorStops.length; i++) {
        var attrs = this.colorStops[i];
        var stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        for (var attr in attrs) {
          if (attrs.hasOwnProperty(attr)) stop.setAttribute(attr, attrs[attr]);
        }
        this.gradient.appendChild(stop);
      }
      this.svg.appendChild(this.gradient);
      this.path.setAttribute('fill', 'url(#' + _id + ')');
      this.path2.setAttribute('fill', this.btn.dataset.basecolor);
      this.updateGradient(30);
    }

    /**
     * @description Creates the SVG buttons
     */

  }, {
    key: 'createButton',
    value: function createButton() {
      var _this = this;

      var pathDef = '';
      var pathDef2 = '';

      this.layers[1].points.map(function (coordinate, i) {
        var next = _this.layers[1].points[i + 1] ? _this.layers[1].points[i + 1] : _this.layers[1].points[0];
        var command = i === 0 ? 'M' : 'C';
        if (i === 0) {
          pathDef = pathDef + ' ' + command + ' ' + coordinate.x + ', ' + coordinate.y;
        } else {
          pathDef = pathDef + ' ' + command + ' ' + coordinate.x + ' ' + coordinate.y + ', ' + next.x + ' ' + next.y + ', ' + coordinate.x + ' ' + coordinate.y;
        }
      });

      this.layers[0].points.map(function (coordinate, i) {
        var next = _this.layers[0].points[i + 1] ? _this.layers[0].points[i + 1] : _this.layers[0].points[0];
        var command = i === 0 ? 'M' : 'L';
        if (i === 0) {
          pathDef2 = pathDef2 + ' ' + command + ' ' + coordinate.x + ', ' + coordinate.y;
        } else {
          pathDef2 = pathDef2 + ' ' + command + ' ' + coordinate.x + ' ' + coordinate.y + ', ' + next.x + ' ' + next.y + ', ' + coordinate.x + ' ' + coordinate.y;
        }
      });

      this.path.setAttribute('d', pathDef);
      this.path2.setAttribute('d', pathDef2);
    }

    /**
     * @description Create the points to describe the buttons area
     *
     * NOTE: the ~~ (bitwise operator) is fastest in Safari than Math.floor
     */

  }, {
    key: 'calculateAreaPoints',
    value: function calculateAreaPoints() {
      var points = [];
      var len = this.layers.length;

      for (var i = 0; i < len; i++) {
        var layer = this.layers[i];
        var _points = [];

        for (var x = ~~(this.height / 2); x < this.width - ~~(this.height / 2); x += this.gap) {
          _points.push(this.createPoint(x + this.margin + this.padding, this.margin + this.padding));
        }

        for (var alpha = ~~(this.height * 1.25); alpha >= 0; alpha -= this.gap) {
          var angle = Math.PI / ~~(this.height * 1.25) * alpha;
          var _x = Math.sin(angle) * this.height / 2 + (this.margin + this.padding) + this.width - this.height / 2;
          var y = Math.cos(angle) * this.height / 2 + (this.margin + this.padding) + this.height / 2;
          _points.push(this.createPoint(_x, y));
        }

        for (var _x2 = this.width - ~~(this.height / 2) - 1; _x2 >= ~~(this.height / 2); _x2 -= this.gap) {
          _points.push(this.createPoint(_x2 + this.margin + this.padding, this.margin + this.height + this.padding));
        }

        for (var _alpha = 0; _alpha <= ~~(this.height * 1.25); _alpha += this.gap) {
          var _angle = Math.PI / ~~(this.height * 1.25) * _alpha;
          var _x3 = this.height - Math.sin(_angle) * this.height / 2 + (this.margin + this.padding) - this.height / 2;
          var _y = Math.cos(_angle) * this.height / 2 + (this.margin + this.padding) + this.height / 2;
          _points.push(this.createPoint(_x3, _y));
        }

        layer.points = _points;
      }
    }

    /**
     * @description Create a point Object
     */

  }, {
    key: 'createPoint',
    value: function createPoint(x, y) {
      return { x: x, y: y, ox: x, oy: y, vx: 0, vy: 0 };
    }

    /**
     * @description MouseOut Event handler
     */

  }, {
    key: 'update',


    /**
     * @description Update the points position relative to mouse
     */
    value: function update() {
      var len = this.layers.length;

      for (var i = 0; i < len; i++) {
        var layer = this.layers[i];
        var points = layer.points;
        var _len = points.length;

        for (var _i = 0; _i < _len; _i++) {
          var point = points[_i];
          var dx = point.ox - point.x + (Math.random() - 0.5);
          var dy = point.oy - point.y + (Math.random() - 0.5);
          var d = Math.sqrt(dx * dx + dy * dy);
          var f = d * this.forceFactor;

          point.vx += f * (dx / d || 0);
          point.vy += f * (dy / d || 0);

          for (var j = 0; j < this.touches.length; j++) {
            var touch = this.touches[j];
            var mouseForce = layer.mouseForce;
            if (touch.x > this.margin && touch.x < this.margin + this.width && touch.y > this.margin && touch.y < this.margin + this.height) {
              mouseForce *= -this.hoverFactor;
            }
            var mx = point.x - touch.x;
            var my = point.y - touch.y;
            var md = Math.sqrt(mx * mx + my * my);
            var mf = Math.max(-layer.forceLimit, Math.min(layer.forceLimit, mouseForce * touch.force / md));
            point.vx += mf * (mx / md || 0);
            point.vy += mf * (my / md || 0);
          }

          point.vx *= layer.viscosity;
          point.vy *= layer.viscosity;
          point.x += point.vx;
          point.y += point.vy;

          if (this.touches.length > 0) {
            var stop = this.touches[0].x / this.width * 100;
            this.updateGradient(stop);
          }
        }
      }
    }

    /**
     * @description Create a point Object
     */

  }, {
    key: 'updateGradient',
    value: function updateGradient(value) {
      if (value > 70) return;
      var stops = this.gradient.querySelectorAll('stop');
      var stopOne = stops[0];
      var stopTwo = stops[1];
      stopOne.setAttribute('offset', value + '%');
      stopTwo.setAttribute('offset', value + 50 + '%');
    }
  }, {
    key: 'animate',
    value: function animate() {
      var _this2 = this;

      this.raf(function () {
        _this2.update();
        _this2.createButton();
        _this2.animate();
      });
    }
  }, {
    key: 'distance',
    value: function distance(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    /**
     * @description Request animation frame
     */

  }, {
    key: 'resize',


    /**
     * @description Resize event handler
     */
    value: function resize() {
      this.rect = this.btn.getBoundingClientRect();
      this.r = (this.rect.height - this.padding) * 0.5;
      this.width = this.rect.width - this.padding * 2;
      this.height = this.rect.height - this.padding * 2;
      if (this.width > 300) this.gap = 3;
      if (this.width > 500) this.gap = 5;
      this.points = this.calculateAreaPoints();
    }

    /**
     * @description get an unique id
     */

  }, {
    key: 'mouseover',
    get: function get() {
      var _this3 = this;

      return function (event) {
        _this3.btn.addEventListener('mousemove', _this3.mousemove, false);
      };
    }

    /**
     * @description MouseMove Event handler
     */

  }, {
    key: 'mousemove',
    get: function get() {
      var _this4 = this;

      return function (event) {
        _this4.touches = [{
          x: event.offsetX,
          y: event.offsetY,
          z: 0,
          force: 1
        }];
      };
    }

    /**
     * @description MouseOut Event handler
     */

  }, {
    key: 'mouseout',
    get: function get() {
      var _this5 = this;

      return function (event) {
        _this5.touches = [];
        _this5.btn.removeEventListener('mousemove', _this5.mousemove, false);
      };
    }

    /**
     * @description MouseOut Event handler
     */

  }, {
    key: 'click',
    get: function get() {
      var _this6 = this;

      return function (event) {
        console.log(_this6);
      };
    }
  }, {
    key: 'raf',
    get: function get() {
      return this.__raf || (this.__raf = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        setTimeout(callback, 60);
      }).bind(window));
    }
  }, {
    key: 'udid',
    get: function get() {
      return Math.random().toString(16).slice(-4);
    }
  }]);

  return LiquidButton;
}();
