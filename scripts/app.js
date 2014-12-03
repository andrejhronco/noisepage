(function(){
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();
	var W = window.innerWidth;
	var H = window.innerHeight;
	
	// start
	init();

	function init(){
		// var pcx = counter(1, 10, 10);
		// console.log('pcx:',pcx);
		var pan1 = panner(audioCtx, {x: Math.random() * W, y: Math.random() * H, z: 100});
		var pan2 = panner(audioCtx, {x: Math.random() * W, y: Math.random() * H, z: 10});
		var pan3 = panner(audioCtx, {x: Math.random() * W, y: Math.random() * H, z: 100});

		noise(audioCtx,"brown", pan1);
		noise(audioCtx,"pink", pan2);
		noise(audioCtx,"pink", pan3);

}
/* Audio Functions */
	function Modulator (context, type, freq, gain) {
	  this.modulator = context.createOscillator();
	  this.gain = contexto.createGain();
	  this.modulator.type = type;
	  this.modulator.frequency.value = freq;
	  this.gain.gain.value = gain;
	  this.modulator.connect(this.gain);
	  this.modulator.start(0);
	  console.log('Mod:', type, freq, gain);
	}

	function noise(context, type, pan){
		//type = {type: "brown", gain: n}
		var n, ng, lfo,lfog;
		switch(type.toLowerCase()){
			case "brown":
				n = context.createBrownNoise();
				break;
			case "white":
				n = context.createWhiteNoise();
				break;
			case "pink":
				n = context.createPinkNoise();
			default:
				break;
		}
		/*
				var modulatorStackNode = [
				    new Modulator(audioCtx, "sawtooth", 100*Math.random(), 100*Math.random()),
				    new Modulator(audioCtx, "square", 100*Math.random(), 100*Math.random()),
				    new Modulator(audioCtx, "sine", 100*Math.random(), 100*Math.random()),
				    new Modulator(audioCtx, "square", 100*Math.random(), 100*Math.random()),
				    new Modulator(audioCtx, "sine", 100*Math.random(), 100*Math.random())
				].reduce(function (input, output) {
				    input.gain.connect(output.modulator.frequency);
				    return output;
				});
				
				var osc = audioCtx.createOscillator();
				osc.type = "sine";
				osc.frequency.value = wd.temp;
				modulatorStackNode.gain.connect(osc.frequency);

				var filter = audioCtx.createBiquadFilter();
				filter.frequency.value = wd.pressure;
				filter.Q.value = 10;
				osc.connect(filter);
				filter.connect(audioCtx.destination);
		*/
		ng = context.createGain();

		lfo = context.createOscillator();
		lfo.frequency.value = Math.random() * .5; //controls the crazy
		lfog = context.createGain();
		lfog.gain.value = Math.random() * 100;

		lfo.start(0);
		lfo.connect(lfog);
		lfog.connect(ng.gain);

		if(pan){ //gain is low when pan is enabled
			n.connect(pan);
			pan.connect(ng);
			ng.gain.value = 10;
			ng.connect(context.destination);
		} else{
			n.connect(ng);
			ng.gain.value = 1;
			ng.connect(context.destination);	
		}
		
	}

	function panner(context, position, velocity){
		//position = {x: x, y: y, z: z}
		//velocity = {x: x, y: y, z: z}
		var panner, listener; 
		panner = context.createPanner();
		listener = context.listener;

		listener.dopplerFactor = 1;
		listener.speedOfSound = 343.3;
		listener.setOrientation(0,0,-1,0,1,0);
		listener.setPosition(W/2, H/2, 300);

		panner.panningModel = 'equalpower';
		panner.setOrientation(1,0,0);
		// function pan(event) {
		// 	var x = this.valueAsNumber,
		// 	    y = 0,
		// 	    z = 1 - Math.abs(x);
		// 	panner.setPosition(x,y,z);
		// }
		panner.setPosition(position.x, position.y, position.z);
		panner.setVelocity(100,0,100);

		return panner;
	}
	
	function filter(context, type, freq){
	/*
			var pinkNoise = audioCtx.createPinkNoise();
			var pinkGain = audioCtx.createGain();
			var pinkFilter = audioCtx.createBiquadFilter();
			pinkGain.gain.value = 100;
			pinkFilter.frequency.value = 1.618;
			pinkNoise.connect(pinkFilter);
			pinkFilter.connect(pinkGain);

			var saw = audioCtx.createOscillator();
			// type
			saw.type = saw.SAWTOOTH;
			//freq
			saw.frequency.value = 150.0;
			var sawGain = audioCtx.createGain();
			sawGain.gain.value = 0.2;

			saw.start(0);
			saw.connect(sawGain);
			pinkGain.connect(saw.frequency);
			sawGain.connect(audioCtx.destination);
			*/
			// return sawGain;
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

	function counter(min, max, speed){
		var n = min || 0, max = max || 0, down = false;
		return setInterval(function(){
			if (n == max) {
				down = true;
			} else if(n == min) {
				down = false;
			}
			if(down){ 
				n--;
			} else {
				n++;	
			}
			//console.log('n:', n);
			return n;
			
		}, speed);

		
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