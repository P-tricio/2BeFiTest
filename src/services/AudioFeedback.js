class AudioFeedback {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = true;
    }

    speak(text) {
        if (!this.enabled || !this.synth) return;

        // Cancel previous utterances
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }

    countdown(seconds) {
        if (seconds > 3) return; // Only speak 3, 2, 1
        if (seconds > 0) {
            this.speak(String(seconds));
        } else if (seconds === 0) {
            this.speak('¡Ya!');
        }
    }

    complete() {
        this.speak('¡Tiempo terminado! Buen trabajo.');
    }
    playTone(frequency = 1000, duration = 0.1) {
        if (!this.enabled) return;
        // Resume context if suspended (browser auth policy)
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => { });
        }
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        // Short beep envelople
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + duration);
        oscillator.stop(this.audioCtx.currentTime + duration);
    }

    tick() { this.playTone(1200, 0.05); } // High beep (UP)
    tock() { this.playTone(800, 0.05); }  // Low beep (DOWN)
}

export const audioFeedback = new AudioFeedback();
