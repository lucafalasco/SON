function rgbToRgba(rgb, opacity) {
  const regEx = /rgb\(([0-9]+),\s+([0-9]+),\s+([0-9]+)/
  const match = rgb.match(regEx)
  const colors = [match[1], match[2], match[3]].join(', ')
  if (opacity === undefined) {
    return 'rgb(' + colors + ')'
  }
  return 'rgba(' + colors + ', ' + opacity + ')'
}

function getColor(length, maxLength) {
  const i = length * 255 / maxLength
  const r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128)
  const g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128)
  const b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128)
  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
}

const Visualizer = function () {
  let circles = []
  let canvas
  let ctx
  let audioSource
  let maxVolume = 10000

  class Circle {
    constructor(x, y, size, ctx) {
      this.x = x
      this.y = y
      this.angle = Math.atan(Math.abs(y) / Math.abs(x))
      this.size = size
      this.ctx = ctx
      this.high = 0
    }

    drawCircle() {
      const distanceFromCentre = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))

      // Draw circles according to relative distanceFromCentre and overallVolume
      const distanceVolumeRatio =
        5 +
        Math.min(
          Math.pow(distanceFromCentre, 2) * Math.pow(audioSource.overallVolume, 2) / 24e10,
          distanceFromCentre / 2
        )

      if (audioSource.overallVolume > maxVolume) {
        maxVolume = audioSource.overallVolume
      }
      const color = getColor(audioSource.overallVolume, maxVolume)

      this.ctx.beginPath()
      this.ctx.arc(this.x, this.y, distanceVolumeRatio / 5 * this.size, 0, Math.PI * 2, true)
      this.ctx.fillStyle = color
      this.ctx.fill()

      // Circle movement coming towards the camera
      const speed = distanceVolumeRatio / 20 * this.size
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

      if (this.y > limitY || this.y < -limitY || (this.x > limitX || this.x < -limitX)) {
        // Visualisation has gone off the edge so respawn it somewhere near the middle.
        this.x = Math.random() - 0.5
        this.y = Math.random() - 0.5
        this.angle = Math.atan(Math.abs(this.y) / Math.abs(this.x))
      }
    }
  }

  const makeCirclesArray = () => {
    let x, y, size
    let limit = canvas.width / 3
    circles = []

    // Push the circles into the array according to the limit
    for (let i = 0; i < limit; i++) {
      x = Math.random() - 0.5
      y = Math.random() - 0.5
      size = (Math.random() + 0.1) * 3
      circles.push(new Circle(x, y, size, ctx))
    }
  }

  this.resizeCanvas = () => {
    if (canvas) {
      // Resize the canvas
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      ctx.translate(canvas.width / 2, canvas.height / 2)
      makeCirclesArray()
    }
  }

  const drawRootCircle = () => {
    const color = getColor(audioSource.overallVolume, maxVolume)

    ctx.beginPath()
    ctx.arc(0, 0, 5, 0, Math.PI * 2, true)
    ctx.fillStyle = color
    ctx.fill()
  }

  const draw = () => {
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)

    circles.forEach(circle => {
      circle.drawCircle()
    })
    drawRootCircle()

    window.requestAnimationFrame(draw)
  }

  this.init = options => {
    audioSource = options.audioSource
    const container = document.getElementById(options.containerId)

    // Create canvas
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
    container.appendChild(canvas)

    makeCirclesArray()
    this.resizeCanvas()
    draw()
  }
}

module.exports = Visualizer
