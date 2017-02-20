/*
	on load: create random amount of noise / panner sets with random noise type value
	change frequency values via mouse / midi / data.gui
	populate dat.gui based off of random creation

	'refresh all'f function

	noiseControl is where dat.gui is created and set

*/


// set init lfo/g lets to 0
// makeNoise() is init, called on load and then onChange, contains all noise() instances
// on gui change set lfo/g values and pass them to makeNoise()/noise()
// might need a func on gui change that returns all values, pass these into noise() and call makeNoise()
/*
var first = true
// var maxChannelCount = Tone.context.destination.maxChannelCount;
var maxChannelCount = 8
// console.log('Tone.context', Tone.context);
// if set to max 8 it works fine in Chrome, but this line
// breaks the audio if the sound card has got more than 8 channels
Tone.context.destination.channelCount = maxChannelCount;
// Tone.context.destination.channelCountMode = "explicit";
// Tone.context.destination.channelInterpretation = "discrete";

var channelMerger = Tone.context.createChannelMerger(maxChannelCount);
// channelMerger.channelCount = 1;
channelMerger.channelCountMode = "explicit";
channelMerger.channelInterpretation = "discrete";
channelMerger.connect(Tone.context.destination);

// create osc
let oscillators = []
for(var i = 0; i < maxChannelCount; i++){
  var oscillator = Tone.context.createOscillator();
  // oscillator.connect(channelMerger, 0, i);
  oscillator.type = 'sawtooth'
  oscillator.frequency.value = (i + 1) * 0.15
  oscillator.start(0);
  oscillators.push(oscillator)

}
// console.log('oscillator', oscillators);

function setChannels(collection){
	let channels = [0,1,2,3,4,5,6,7]
	channels.sort(() => 0.5 - Math.random())
	// console.log('channels', channels);
	oscillators.map( (osc, index) => {
		// console.log('channel index', channels[index]);
		// console.log('osc freq', osc);
		if(!first) osc.disconnect()
		osc.connect(channelMerger, 0, channels[index])
	})
	first = false
}

setInterval(() => {
	setChannels(oscillators)
}, 5000)
*/

// add gain to each noise
// add gui to mod frequency

(function(Tone){
	const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'],
				noiseTypes = ['pink', 'pink', 'brown', 'white'],
				letters = ['A', 'B', 'C', 'D', 'E', 'F']

	let preset = [{
			type: 'brown',
			volume: random(),
			panRate: random([1,10]),
			modRate: random([1,10])
		},{
			type: 'pink',
			volume: random(),
			panRate: random([1,10]),
			modRate: random([1,10])
		},{
			type: 'white',
			volume: random(),
			panRate: random([1,10]),
			modRate: random([1,10])
	}]

	let interval = 10000, intervalID

	let noiseSets = makeNoiseSet(preset)

	// DAT GUI
	let gui = new dat.GUI(),
			controls = createControls(noiseSets)

	addGUI(controls, noiseSets)

	gui.add(controls, 'randomize')
	gui.add(controls, 'randomizer').onChange((active) => {
		if(intervalID) clearInterval(intervalID)
		if(active){
			intervalID = setInterval(() => {
				randomizer()
			}, controls.interval)
			console.log('turning on randomizer')
		} else {
			console.log('turning off randomizer')
		}
	}).listen()
	gui.add(controls, 'interval', 1000, 60000)

	gui.add(controls, 'start')
	gui.add(controls, 'stop')

// gui.remember(controls);

function createControls(noiseSets){
	let controls = {
		randomizer : false,
		randomize : randomizer,
		interval : interval,
		start : noiseSets.startAll,
		stop : () => {
			if(intervalID) clearInterval(intervalID)
			noiseSets.stopAll()
		}
	}

	noiseSets.sets.forEach((set, i) => {
		controls['volume'+ letters[i]] = noiseSets.sets[i].gain.gain.value
		controls['panRate'+ letters[i]] = noiseSets.sets[i].pan.frequency.value
		controls['modRate'+ letters[i]] = noiseSets.sets[i].mod.frequency.value
	})

	return controls
}

function addGUI(controls, noiseSets){
	noiseSets.sets.map((set, i) => {
		let noise = gui.addFolder('Noise ' + letters[i] + ' (' + set.noise.type + ')')
		noise.open()

		noise.add(controls, 'volume'+letters[i], 0.0, 1.0).step(0.1).onChange((value) => {
			set.gain.gain.setValueAtTime(value, 0)
		}).listen();

		noise.add(controls, 'panRate'+letters[i], 1, 10).onChange((value) => {
			set.pan.frequency.setValueAtTime(value, 0)
		}).listen();

		noise.add(controls, 'modRate'+letters[i], 1, 500).onChange((value) => {
			set.mod.frequency.setValueAtTime(value, 0)
		}).listen();
	})
}

function randomizer(){
	interval = controls.interval
	noiseSets.sets.map( (noiseSet, i) => {
		console.log('\nnoise'+letters[i])
		noiseSet.noise.type = noiseTypes[random([0,noiseTypes.length-1], true)]
		noiseSet.pan.type = waveTypes[random([0,waveTypes.length-1], true)]

		switch(random([0,2], true)){
			case 0:
				noiseSet.pan.set({'frequency': random([1,10])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.pan.set({'frequency': random([1,10])}, interval)
				break;
			case 2:
				noiseSet.pan.frequency.value = random([1,10])
		}
		// update gui
		controls['panRate'+letters[i]] = noiseSet.pan.frequency.value

		console.log('pan freq', noiseSet.pan.frequency.value)

		noiseSets.sets.map( noiseSet => noiseSet.pan.depth.value = random(1))
/*
		switch(random([0,2], true)){
			case 0:
				noiseSet.noise.set({'volume': random([-50, 0])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.noise.set({'volume': random([-50, 0])}, interval)
				break;
			case 2:
				noiseSet.noise.volume.value = random([-50, 0])
		}

		// update gui
		controls['volume'+letters[i]] = noiseSet.noise.volume.value

		console.log('noise vol', noiseSet.noise.volume.value)
*/
		switch(random([0,2], true)){
			case 0:
				noiseSet.mod.set({'frequency': random([1,500]), 'volume': random([-50,0])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.mod.set({'frequency': random([1,500]), 'volume': random([-50,0])}, interval)
				break;
			case 2:
				noiseSet.mod.frequency.value = random([1,500])
				noiseSet.mod.volume.value = random([-5,0])
		}

		// update gui
		controls['modRate'+letters[i]] = noiseSet.mod.frequency.value

		console.log('mod freq', noiseSet.mod.frequency.value)
		console.log('mod volume', noiseSet.mod.volume.value)

		noiseSet.mod.frequency.type = waveTypes[random([0,waveTypes.length-1], true)]

		// noiseSet.pitchShift.value = random([1,12], true)
		let partials = Array.from({length: random([1,5], true)}).map(item => random())
		if(random([0,1], true)) noiseSet.mod.partials = partials

	})
}
})(Tone);

function makeNoiseSet(preset){
	let sets = preset.map( setting => {
		return makeNoise(setting)
	})

	return {
		sets: sets,
		startAll: () => {
			sets.forEach(n => n.start())
		},
		stopAll: () => {
			sets.forEach(n => n.stop())
		}
	}
}

function makeNoise(settings) {
	let noise = new Tone.Noise(settings.type),
			pan = new Tone.AutoPanner(settings.panRate),
			mod = new Tone.Oscillator(settings.modRate),
			gain = new Tone.Gain(settings.volume)
			// pitchShift = new Tone.PitchShift(random(12))

	mod.connect(noise.volume)
	// mod.connect(pan.frequency)
	// noise.chain(pan, pitchShift, Tone.Master)
	noise.chain(gain, pan, Tone.Master)

	return {
		noise: noise,
		gain: gain,
		pan: pan,
		mod: mod,
		// pitchShift: pitchShift,
		start: () => {
			pan.start()
			noise.start()
			mod.start()

			return this
		},
		stop: () => {
			pan.stop()
			noise.stop()
			mod.stop()

			return this
		}
	}
}

/*
	function time(){
		let d = new Date(),
				y = d.getFullYear(),
				mo = d.getMonth(),
				da = d.getDay(),
				h = d.getHours(),
				m = d.getMinutes(),
				s = d.getSeconds()
		return {
			alltime: y + '-' + mo + '-' + da + '_' + h + ':' + m + ':' + s,
			year: y,
			month: m,
			day: da,
			hour: h,
			minute: m,
			second: s
		};
	}
*/

/*
	function print_data(data){
		let info = document.createElement('div');
		for(p in data){
			info.innerHTML += p + ' : ' + data[p] + '<br>';
		}
		document.body.appendChild(info);
	}
*/

function random(range = 1, int = false){
	let num

	if(Array.isArray(range)){
		if(int){
			num = Math.floor( Math.random() * (range[1] + 1 - range[0]) + range[0] );
		} else {
			num = Math.random() * (range[1] - range[0]) + range[0];
		}
	} else {
		if(int){
			num = Math.floor(Math.random() * range)
		} else {
			num = Math.random() * range
		}
	}
	return num
}

/*
	// ios enable sound output
	window.addEventListener('touchstart', function(){
		//create empty buffer
		let buffer = audioCtx.createBuffer(1, 1, 22050);
		let source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start(0);
	}, false);
*/
