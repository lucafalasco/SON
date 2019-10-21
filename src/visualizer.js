function scale(domain, range, value) {
  value = value > domain[1] ? domain[1] : value < domain[0] ? domain[0] : value
  const percent = (value - domain[0]) / (domain[1] - domain[0])

  return percent * (range[1] - range[0]) + range[0]
}

function getColor(length, maxLength) {
  const i = (length * 255) / maxLength
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
  let start
  let maxVolume = 10000

  class Circle {
    constructor(x, y, radius, intensity, color) {
      this.x = x
      this.y = y
      this.radius = radius
      this.angle = Math.atan(Math.abs(y) / Math.abs(x))
      this.intensity = intensity
      this.color = color
      this.high = 0
    }

    drawCircle() {
      const limit = Math.max(canvas.width, canvas.height) / 2
      const radiusScaleFactor = scale([0, 10000], [0, 3], this.intensity)
      const radius = this.radius * radiusScaleFactor

      if (radius > limit) {
        const index = circles.indexOf(this)
        if (index > -1) {
          circles.splice(index, 1)
        }
      }

      ctx.beginPath()
      ctx.lineWidth = scale([0, 10000], [0, 10], this.intensity)
      ctx.globalAlpha = scale([0, limit], [1, 0], radius)
      ctx.strokeStyle = this.color
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, true)
      ctx.stroke()

      this.radius++
    }
  }

  function addNewCircle() {
    const intensity = Math.max(audioSource.overallVolume)
    const color = getColor(audioSource.overallVolume, maxVolume)

    circles.push(new Circle(0, 0, 0, intensity, color))
  }

  this.resizeCanvas = () => {
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      ctx.translate(canvas.width / 2, canvas.height / 2)
      reset()
    }
  }

  function draw(timestamp) {
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)

    const interval = 500
    if (!start) start = timestamp
    const progress = timestamp - start

    if (progress > interval) {
      addNewCircle()
      start = 0
    }

    circles.forEach(circle => {
      circle.drawCircle()
    })

    window.requestAnimationFrame(draw)
  }

  function reset() {
    circles = []
    start = null
  }

  this.init = options => {
    audioSource = options.audioSource
    const container = document.getElementById(options.containerId)

    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
    container.appendChild(canvas)

    reset()
    this.resizeCanvas()
    draw()
  }
}

module.exports = Visualizer
