let audioCtx;
let windNoiseNode;
let filterNode;
let gainNode;

export function initSoundscape() {
  if (audioCtx) return;
  
  const startAudio = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    windNoiseNode = audioCtx.createBufferSource();
    windNoiseNode.buffer = noiseBuffer;
    windNoiseNode.loop = true;
    
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 400;
    
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.05;
    
    windNoiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    windNoiseNode.start(0);
    
    const modulate = () => {
      if (!audioCtx) return;
      const freq = 300 + Math.random() * 500;
      const time = 2 + Math.random() * 4;
      filterNode.frequency.linearRampToValueAtTime(freq, audioCtx.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.06, audioCtx.currentTime + time);
      setTimeout(modulate, time * 1000);
    };
    modulate();
    
    window.removeEventListener('click', startAudio);
  };

  window.addEventListener('click', startAudio);
}
