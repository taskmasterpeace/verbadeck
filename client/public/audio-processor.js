// AudioWorklet processor for capturing and converting audio to PCM16
// This runs in the AudioWorklet thread (separate from main thread)

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 800; // ~50ms at 16kHz
    this.buffer = [];
  }

  // Convert Float32 samples to PCM16 (Int16)
  floatTo16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    // Handle mono input
    if (input && input[0]) {
      const samples = input[0]; // First channel (mono)

      // Add to buffer
      for (let i = 0; i < samples.length; i++) {
        this.buffer.push(samples[i]);
      }

      // Send chunks of ~800 samples (50ms at 16kHz)
      while (this.buffer.length >= this.bufferSize) {
        const chunk = this.buffer.splice(0, this.bufferSize);
        const float32Array = new Float32Array(chunk);
        const pcm16 = this.floatTo16BitPCM(float32Array);

        // Send binary data to main thread
        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      }
    }

    // Keep processor alive
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
