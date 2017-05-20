import Visualizer from './visualizer'

class MicrophoneAudioSource {
  constructor() {
    this.overallVolume = 0
    this.streamDataArray = new Uint8Array(128)
    this.getAudio()
  }

  // Get an overall volume value
  sampleAudioStream(analyser) {
    analyser.getByteFrequencyData(this.streamDataArray)

    let total = 0
    this.streamDataArray.forEach((item) => {
      total += item
    })
    this.overallVolume = total
  }

  // Get input stream from the microphone
  getAudio() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio : true }).then((stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)
        const mic = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        mic.connect(analyser)
        setInterval(() => this.sampleAudioStream(analyser), 1)
      })
      .catch(function (err) {
        window.alert('Error Getting Microphone Input.', err)
      })
    } else {
      window.alert('Browser Not Supported.')
    }
  }
}

const visualizer = new Visualizer()
const audioSource = new MicrophoneAudioSource()

visualizer.init({
  containerId : 'visualizer',
  audioSource : audioSource,
})

// Listeners

window.addEventListener('resize', visualizer.resizeCanvas)

window.toggleTheme = (theme) => {
  visualizer.changeTheme(theme)
}

window.launchIntoFullScreen = () => {
  const visualizerContainer = document.getElementById("visualizer")
  if (visualizerContainer.requestFullscreen) {
    visualizerContainer.requestFullscreen()
  } else if (visualizerContainer.mozRequestFullScreen) {
    visualizerContainer.mozRequestFullScreen()
  } else if (visualizerContainer.webkitRequestFullscreen) {
    visualizerContainer.webkitRequestFullscreen()
  } else if (visualizerContainer.msRequestFullscreen) {
    visualizerContainer.msRequestFullscreen()
  }
}
