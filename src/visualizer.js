const COLOURS = {
  blue       : '#1843f9',
  light_blue : '#18b4f9',
  green      : '#43f918',
  yellow     : '#f9ce18',
  orange     : '#f95d18',
  red        : '#F91843',
  pink       : '#ce18f9',
  white      : '#ffffff',
}

const Visualizer = function () {
  let lines = []
  let canvas
  let ctx
  let audioSource

  class Slab {
    constructor(x, y, lineSize, ctx) {
      this.x = x
      this.y = y
      this.angle = Math.atan(Math.abs(y) / Math.abs(x))
      this.lineSize = lineSize
      this.ctx = ctx
      this.high = 0
    }

    setColour(colour) {
      this.colour = colour
    }

    drawLine() {
      const distanceFromCentre = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))

      // Draw lines according to relative distanceFromCentre and overallVolume
      this.ctx.lineWidth = 1 + distanceFromCentre / 10 * Math.max(this.lineSize / 2, 1)
      this.ctx.strokeStyle = this.colour
      this.ctx.beginPath()
      this.ctx.moveTo(this.x, this.y)
      const lineLength = 5 + Math.min(
        Math.pow(distanceFromCentre, 2) * Math.pow(audioSource.overallVolume, 2) / 24e10,
        distanceFromCentre / 2)
      let toX = Math.cos(this.angle) * -lineLength
      let toY = Math.sin(this.angle) * -lineLength
      toX *= this.x > 0 ? 1 : -1
      toY *= this.y > 0 ? 1 : -1

      this.ctx.lineTo(this.x + toX, this.y + toY)
      this.ctx.stroke()
      this.ctx.closePath()

      // Line movement coming towards the camera
      const speed = lineLength / 20 * this.lineSize
      this.high -= Math.max(this.high - 0.0001, 0)
      if (speed > this.high) {
        this.high = speed
      }
      const dX = Math.cos(this.angle) * this.high
      const dY = Math.sin(this.angle) * this.high
      this.x += this.x > 0 ? dX : -dX
      this.y += this.y > 0 ? dY : -dY

      const limitY = canvas.height
      const limitX = canvas.width

      if ((this.y > limitY || this.y < -limitY) || (this.x > limitX || this.x < -limitX)) {
        // Visualisation has gone off the edge so respawn it somewhere near the middle.
        this.x = (Math.random() - 0.5)
        this.y = (Math.random() - 0.5)
        this.angle = Math.atan(Math.abs(this.y) / Math.abs(this.x))
      }
    }
  }

  const makeLinesArray = () => {
    let x, y, lineSize
    let limit = canvas.width / 5
    lines = []

    // Push the lines into the array according to the limit
    for (let i = 0; i < limit; i++) {
      x = (Math.random() - 0.5)
      y = (Math.random() - 0.5)
      lineSize = (Math.random() + 0.1) * 3
      lines.push(new Slab(x, y, lineSize, ctx))
    }
  }

  this.resizeCanvas = () => {
    if (canvas) {
      // Resize the canvas
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      ctx.translate(canvas.width / 2, canvas.height / 2)
      makeLinesArray()
    }
  }

  const draw = () => {
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)

    lines.forEach((line) => {
      line.drawLine()
    })

    window.requestAnimationFrame(draw)
  }

  this.init = (options) => {
    audioSource = options.audioSource
    const container = document.getElementById(options.containerId)

    // Create canvas
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
    container.appendChild(canvas)

    makeLinesArray()
    this.resizeCanvas()
    Slab.prototype.setColour(COLOURS.orange)
    draw()
  }

  this.changeTheme = (theme) => {
    Slab.prototype.setColour(COLOURS[theme])
  }
}

module.exports = Visualizer
