/**
 * Liquid SVG Button
 * Author: Edgar Bermejo
 * Version: 0.1.0 Beta
 *
 *
 * TODO:
 * - Test, test, test...
 * - Responsive.
 * - Icon as placeholder.
 * - More config options.
 */
class LiquidButton {

  constructor (btn) {
    this.btn = btn
    this.pathDef = ''
    this.padding = parseFloat(this.btn.dataset.padding) || 20
    this.margin = 1
    this.gap = 1
    this.rect = this.btn.getBoundingClientRect()
    this.r = (this.rect.height - this.padding) * 0.5
    this.width = this.rect.width - (this.padding * 2)
    this.height = this.rect.height - (this.padding * 2)
    this.touches = []
    this.tension = 0.4
    this.hoverFactor = -0.76
    // this.hoverFactor = -0.1
    this.forceFactor = 0.24
    // this.forceFactor = 0.2
    let colors = this.btn.dataset.gradient.split(',')
    this.stop = 0
    this.colorStops = [
      { offset: `${ this.stop }%`, 'stop-color': colors[0] },
      { offset: `${ this.stop + 50 }%`, 'stop-color': colors[1] }
    ]
    this.layers = [
      { points: [], viscosity: 0.7, mouseForce: 1200, forceLimit: 2 },
      { points: [], viscosity: 0.5, mouseForce: 100, forceLimit: 3 }
    ]

    this.createPaths()
    this.createPlaceholder()
    this.createBackgrounds()
    this.points = this.calculateAreaPoints()
    this.createButton(btn)

    this.btn.addEventListener('mouseover', this.mouseover, false)
    this.btn.addEventListener('mouseout', this.mouseout, false)
    this.btn.addEventListener('click', this.click, false)
    window.addEventListener('resize', this.resize.bind(this), false)

    this.resize()
    this.animate()
  }


  /**
   * @description Creates the SVG paths
   */
  createPaths () {
    this.svg = this.btn.querySelector('svg')
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.svg.appendChild(this.path2)
    this.svg.appendChild(this.path)
  }


  /**
   * @description Creates the SVG text
   */
  createPlaceholder () {
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = this.btn.dataset.placeholder || ''
    text.setAttribute('x', '50%')
    text.setAttribute('y', '50%')
    text.setAttribute('dy', '0.2em')
    text.setAttribute('style', this.btn.dataset.textstyle || 'fill: white;')
    text.setAttribute('alignment-baseline', 'middle')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('pointer-events', 'none')
    this.svg.appendChild(text)
  }


  /**
   * @description Creates the SVG backgrounds
   */
  createBackgrounds () {
    this.gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    let _id = `${ this.udid }-gradient`
    this.gradient.setAttribute('id', _id)
    this.gradient.setAttribute('gradientTransform', 'rotate(35)')
    for (let i = 0; i < this.colorStops.length; i++){
      let attrs = this.colorStops[i]
      let stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      for (let attr in attrs) {
        if (attrs.hasOwnProperty(attr)) stop.setAttribute(attr, attrs[attr])
      }
      this.gradient.appendChild(stop)
    }
    this.svg.appendChild(this.gradient)
    this.path.setAttribute('fill', `url(#${ _id })`)
    this.path2.setAttribute('fill', this.btn.dataset.basecolor)
    this.updateGradient(30)
  }


  /**
   * @description Creates the SVG buttons
   */
  createButton () {
    let pathDef = ''
    let pathDef2 = ''

    this.layers[1].points.map((coordinate, i) => {
      let next = (this.layers[1].points[i + 1]) ? this.layers[1].points[i + 1] : this.layers[1].points[0]
      let command = i === 0 ? 'M' : 'C'
      if (i === 0) {
        pathDef = pathDef + ' ' + command + ' ' + coordinate.x + ', ' + coordinate.y
      } else {
        pathDef = pathDef + ' ' + command + ' ' + coordinate.x + ' ' + coordinate.y + ', ' + next.x + ' ' + next.y + ', ' + coordinate.x + ' ' + coordinate.y
      }
    })

    this.layers[0].points.map((coordinate, i) => {
      let next = (this.layers[0].points[i + 1]) ? this.layers[0].points[i + 1] : this.layers[0].points[0]
      let command = i === 0 ? 'M' : 'L'
      if (i === 0) {
        pathDef2 = pathDef2 + ' ' + command + ' ' + coordinate.x + ', ' + coordinate.y
      } else {
        pathDef2 = pathDef2 + ' ' + command + ' ' + coordinate.x + ' ' + coordinate.y + ', ' + next.x + ' ' + next.y + ', ' + coordinate.x + ' ' + coordinate.y
      }
    })

    this.path.setAttribute('d', pathDef)
    this.path2.setAttribute('d', pathDef2)
  }



  /**
   * @description Create the points to describe the buttons area
   *
   * NOTE: the ~~ (bitwise operator) is fastest in Safari than Math.floor
   */
  calculateAreaPoints () {
    const points = []
    const len = this.layers.length

    for (let i = 0; i < len; i++) {
      const layer = this.layers[i]
      const points = []

      for (let x = ~~(this.height / 2); x < this.width - ~~(this.height / 2); x += this.gap) {
        points.push(this.createPoint(x + this.margin + this.padding, this.margin + this.padding))
      }

      for (let alpha = ~~(this.height * 1.25); alpha >= 0; alpha -= this.gap) {
        const angle = (Math.PI / ~~(this.height * 1.25)) * alpha
        const x = Math.sin(angle) * this.height / 2 + (this.margin + this.padding) + this.width - this.height / 2
        const y = Math.cos(angle) * this.height / 2 + (this.margin + this.padding) + this.height / 2
        points.push(this.createPoint(x, y))
      }

      for (let x = this.width - ~~(this.height / 2) - 1; x >= ~~(this.height / 2); x -= this.gap) {
        points.push(this.createPoint(x + this.margin + this.padding, this.margin + this.height + this.padding))
      }

      for (let alpha = 0; alpha <= ~~(this.height * 1.25); alpha += this.gap) {
        const angle = (Math.PI / ~~(this.height * 1.25)) * alpha
        const x = (this.height - Math.sin(angle) * this.height / 2) + (this.margin + this.padding) - this.height / 2
        const y = Math.cos(angle) * this.height / 2 + (this.margin + this.padding) + this.height / 2
        points.push(this.createPoint(x, y))
      }

      layer.points = points
    }
  }


  /**
   * @description Create a point Object
   */
  createPoint (x, y) {
    return { x: x, y: y, ox: x, oy: y, vx: 0, vy: 0 }
  }


  /**
   * @description MouseOut Event handler
   */
  get mouseover () {
    return (event) => {
      this.btn.addEventListener('mousemove', this.mousemove, false)
    }
  }


  /**
   * @description MouseMove Event handler
   */
  get mousemove () {
    return (event) => {
      this.touches = [{
        x: event.offsetX,
        y: event.offsetY,
        z: 0,
        force: 1,
      }]
    }
  }


  /**
   * @description MouseOut Event handler
   */
  get mouseout () {
    return (event) => {
      this.touches = []
      this.btn.removeEventListener('mousemove', this.mousemove, false)
    }
  }


  /**
   * @description MouseOut Event handler
   */
  get click () {
    return (event) => {
      console.log(this)
    }
  }


  /**
   * @description Update the points position relative to mouse
   */
  update () {
    const len = this.layers.length

    for (let i = 0; i < len; i++) {
      const layer = this.layers[i]
      const points = layer.points
      const len = points.length

      for (let i = 0; i < len; i++) {
        const point = points[i]
        const dx = point.ox - point.x + (Math.random() - 0.5)
        const dy = point.oy - point.y + (Math.random() - 0.5)
        const d = Math.sqrt(dx * dx + dy * dy)
        const f = d * this.forceFactor

        point.vx += f * ((dx / d) || 0)
        point.vy += f * ((dy / d) || 0)

        for (let j = 0; j < this.touches.length; j++) {
          const touch = this.touches[j]
          let mouseForce = layer.mouseForce
          if (touch.x > this.margin && touch.x < this.margin + this.width && touch.y > this.margin && touch.y < this.margin + this.height) {
            mouseForce *= -this.hoverFactor
          }
          const mx = point.x - touch.x
          const my = point.y - touch.y
          const md = Math.sqrt(mx * mx + my * my)
          const mf = Math.max(-layer.forceLimit, Math.min(layer.forceLimit, (mouseForce * touch.force) / md))
          point.vx += mf * ((mx / md) || 0)
          point.vy += mf * ((my / md) || 0)
        }

        point.vx *= layer.viscosity
        point.vy *= layer.viscosity
        point.x += point.vx
        point.y += point.vy

        if (this.touches.length > 0) {
          let stop = this.touches[0].x / this.width * 100
          this.updateGradient(stop)
        }
      }
    }
  }


  /**
   * @description Create a point Object
   */
  updateGradient (value) {
    if (value > 70) return
    let stops = this.gradient.querySelectorAll('stop')
    let stopOne = stops[0]
    let stopTwo = stops[1]
    stopOne.setAttribute('offset', value + '%')
    stopTwo.setAttribute('offset', value + 50 + '%')
  }


  animate () {
    this.raf(() => {
      this.update()
      this.createButton()
      this.animate()
    })
  }


  distance (p1, p2) { return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) }


  /**
   * @description Request animation frame
   */
  get raf () {
    return this.__raf || (this.__raf = (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback){ setTimeout(callback, 60) }
    ).bind(window))
  }


  /**
   * @description Resize event handler
   */
  resize () {
    this.rect = this.btn.getBoundingClientRect()
    this.r = (this.rect.height - this.padding) * 0.5
    this.width = this.rect.width - (this.padding * 2)
    this.height = this.rect.height - (this.padding * 2)
    if (this.width > 300 ) this.gap = 3
    if (this.width > 500 ) this.gap = 5
    this.points = this.calculateAreaPoints()
  }


  /**
   * @description get an unique id
   */
  get udid () {
    return Math.random().toString(16).slice(-4)
  }
}
