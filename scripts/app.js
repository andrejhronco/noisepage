(function(){
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();
	// console.log('sampleRate: ', audioCtx.sampleRate);
	// start
	//init();

	function init(){
		var brownNoise = audioCtx.createBrownNoise();
		var brownGain = audioCtx.createGain();
		brownGain.gain.value = 0.1;
		brownNoise.connect(brownGain);

		var lfo = audioCtx.createOscillator();
		lfo.frequency.value = Math.random();
		var lfoGain = audioCtx.createGain();
		lfoGain.gain.value = 1;

		lfo.start(0);
		lfo.connect(lfoGain);
		lfoGain.connect(brownGain.gain);
		brownGain.connect(audioCtx.destination);

		var pinkNoise = audioCtx.createPinkNoise();
		var pinkGain = audioCtx.createGain();
		var pinkFilter = audioCtx.createBiquadFilter();
		pinkGain.gain.value = 100;
		pinkFilter.frequency.value = 1.618;
		pinkNoise.connect(pinkFilter);
		pinkFilter.connect(pinkGain);

		var saw = audioCtx.createOscillator();
		saw.type = saw.SAWTOOTH;
		saw.frequency.value = 440.0;
		var sawGain = audioCtx.createGain();
		sawGain.gain.value = 0.2;

		saw.start(0);
		saw.connect(sawGain);
		pinkGain.connect(saw.frequency);
		sawGain.connect(audioCtx.destination);
	}



/* Audio Functions */
	//create more of these audio functions to choose from
	function Modulator (type, freq, gain) {
	  this.modulator = audioCtx.createOscillator();
	  this.gain = audioCtx.createGain();
	  this.modulator.type = type;
	  this.modulator.frequency.value = freq;
	  this.gain.gain.value = gain;
	  this.modulator.connect(this.gain);
	  this.modulator.start(0);
	  console.log('Mod:', type, freq, gain);
	}

/* Utilities */
	function time(){
		var d = new Date(),
				h = d.getHours(),
				m = d.getMinutes(),
				s = d.getSeconds()
		return {
			hour: h,
			minute: m,
			second: s
		};
	}

	function print_data(data){
		var info = document.createElement('div');
		for(p in data){
			info.innerHTML += p + ' : ' + data[p] + '<br>';
		}
		document.body.appendChild(info);
	}

	/* ios enable sound output */
	window.addEventListener('touchstart', function(){
		//create empty buffer
		var buffer = audioCtx.createBuffer(1, 1, 22050);
		var source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start(0);
	}, false);
		
})();