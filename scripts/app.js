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

/* TODO
	better visuals : https://github.com/fluuuid/labs/blob/master/lines/Line.js
*/
let state = {};
const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'],
			noiseTypes = ['pink', 'pink', 'white', 'brown', 'brown'],
			letters = ['A', 'B', 'C', 'D', 'E', 'F'];

(function(Tone){
	let preset = [{
			type: 'brown',
			volume: [-30,0],
			panRate: [1,10],
			modRate: [1,1000]
		},{
			type: 'pink',
			volume: [-30,0],
			panRate: [1,10],
			modRate: [1,1000]
		},{
			type: 'white',
			volume: [-30,0],
			panRate: [1,10],
			modRate: [1,1000]
	}]

	let recorder

	let interval = 10, intervalID

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
			}, controls.interval * 1000)
			console.log('turning on randomizer')
		} else {
			console.log('turning off randomizer')
		}
	}).listen()
	gui.add(controls, 'interval', 1, 60)

	gui.add(controls, 'start')
	gui.add(controls, 'stop')

	gui.add(controls, 'recordStart')
	gui.add(controls, 'recordStop')

	gui.add(controls, 'presetName')
	gui.add(controls, 'save')
	gui.add(controls, 'load', getStoredPresets()).onChange(value => {
		let preset = localStorage.getObject(value)
		setValues(preset, noiseSets.sets, controls)
	}).listen()
	gui.add(controls, 'tinyURL')

	// read state from URL or setState from on load
	if(document.location.hash) {
		state = readPresetFromURL()
		setValues(state, noiseSets.sets, controls)
	} else {
		// save initial state
		setState(noiseSets.sets)
	}

function createControls(noiseSets){
	let controls = {
		randomizer : false,
		randomize : randomizer,
		interval : interval,
		start : noiseSets.startAll,
		stop : () => {
			if(intervalID) clearInterval(intervalID)
			noiseSets.stopAll()
		},
		presetName: 'preset',
		save: function() {
			saveStateToLocal(this.presetName)
		},
		load: [],
		tinyURL: () => {
			getTinyURL(state)
		},
		recordStart: () => {
			if(recorder) recorder.clear()
			recorder = new Recorder(makeMaster(noiseSets.sets), {workerPath: 'scripts/recorderjs/recorderWorker.js'})
			recorder.record()
		},
		recordStop: () => {
			recorder.stop()

			recorder.exportWAV((blob) => {
				var url = URL.createObjectURL(blob);
				Recorder.forceDownload(blob, 'noise-' + new Date().getTime() + '.wav')
			})
			recorder.clear()
		}
	}

	noiseSets.sets.forEach((set, i) => {
		controls['noise.type.'+ letters[i]] = set.noise.type
		controls['pan.type.'+ letters[i]] = set.pan.type
		controls['volume.'+ letters[i]] = set.volume.volume.value
		controls['pan.frequency.'+ letters[i]] = set.pan.frequency.value
		controls['mod.frequency.'+ letters[i]] = set.mod.frequency.value
	})

	return controls
}

function addGUI(controls, noiseSets){
	noiseSets.sets.map((set, i) => {
		let noise = gui.addFolder('Noise ' + letters[i])
		noise.open()

		noise.add(controls, 'noise.type.'+letters[i], [ 'pink', 'brown', 'white' ]).onChange((value) => {
			set.noise.type = value
		}).listen();

		noise.add(controls, 'pan.type.'+letters[i], waveTypes).onChange((value) => {
			set.pan.type = value
		}).listen();

		noise.add(controls, 'volume.'+letters[i], set.volume.range[0], set.volume.range[1]).onChange((value) => {
			set.volume.volume.setValueAtTime(value, 0)
		}).listen();

		noise.add(controls, 'pan.frequency.'+letters[i], set.pan.range[0], set.pan.range[1]).onChange((value) => {
			set.pan.frequency.setValueAtTime(value, 0)
		}).listen();

		noise.add(controls, 'mod.frequency.'+letters[i], set.mod.range[0], set.mod.range[1]).onChange((value) => {
			set.mod.frequency.setValueAtTime(value, 0)
		}).listen();
	})
}

function randomizer(){
	interval = controls.interval * 1000
	noiseSets.sets.map( (noiseSet, i) => {
		// console.log('noiseSet', noiseSet)
		noiseSet.noise.type = noiseTypes[random([0,noiseTypes.length-1], true)]
		noiseSet.pan.type = waveTypes[random([0,waveTypes.length-1], true)]

		// update gui
		controls['noise.type.'+letters[i]] = noiseSet.noise.type

		// update gui
		controls['pan.type.'+letters[i]] = noiseSet.pan.type

		switch(random([0,2], true)){
			case 0:
				noiseSet.pan.set({'frequency': random([noiseSet.pan.range[0],noiseSet.pan.range[1]])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.pan.set({'frequency': random([noiseSet.pan.range[0],noiseSet.pan.range[1]])}, interval)
				break;
			case 2:
				noiseSet.pan.frequency.value = random([noiseSet.pan.range[0],noiseSet.pan.range[1]])
		}
		// update gui
		controls['pan.frequency.'+letters[i]] = noiseSet.pan.frequency.value

		noiseSets.sets.map( noiseSet => noiseSet.pan.depth.value = random(1))

		switch(random([0,2], true)){
			case 0:
				noiseSet.volume.set({'volume': random([noiseSet.volume.range[0],noiseSet.volume.range[1]])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.volume.set({'volume': random([noiseSet.volume.range[0],noiseSet.volume.range[1]])}, interval)
				break;
			case 2:
				noiseSet.volume.volume.value = random([noiseSet.volume.range[0],noiseSet.volume.range[1]])
		}

		// update gui
		controls['volume.'+letters[i]] = noiseSet.volume.volume.value

		switch(random([0,2], true)){
			case 0:
				noiseSet.mod.set({'frequency': random([noiseSet.mod.range[0],noiseSet.mod.range[1]]), 'volume': random([-10,0])}, interval / random([1000,interval]))
				break;
			case 1:
				noiseSet.mod.set({'frequency': random([noiseSet.mod.range[0],noiseSet.mod.range[1]]), 'volume': random([-10,0])}, interval)
				break;
			case 2:
				noiseSet.mod.frequency.value = random([noiseSet.mod.range[0],noiseSet.mod.range[1]])
				noiseSet.mod.volume.value = random([-10,0])
		}

		// update gui
		controls['mod.frequency.'+letters[i]] = noiseSet.mod.frequency.value

		noiseSet.mod.frequency.type = waveTypes[random([0,waveTypes.length-1], true)]

		if(random([0,1], true)) noiseSet.mod.partials = Array.from({length: random([1,5], true)}).map(item => random())

	})
	setState(noiseSets.sets)
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

function makeMaster(noiseSets){
	let master = new Tone.Volume(-5)

	noiseSets.map(set => set.volume.connect(master))

	return master
}

function makeNoise(settings) {
	let noise = new Tone.Noise(settings.type),
			pan = new Tone.AutoPanner(random(settings.panRate)),
			mod = new Tone.Oscillator(random(settings.modRate)),
			volume = new Tone.Volume(random(settings.volume))

	// set ranges on nodes
	pan.range = settings.panRate
	mod.range = settings.modRate
	volume.range = settings.volume

	mod.connect(noise.volume)
	noise.chain(pan, volume, Tone.Master)

	return {
		noise: noise,
		volume: volume,
		pan: pan,
		mod: mod,

		start: () => {
			noise.start()
			pan.start()
			mod.start()

			return this
		},
		stop: () => {
			noise.stop()
			pan.stop()
			mod.stop()

			return this
		}
	}
}

// preset saving / setting
function setState(sets){
	sets.map((set, i) => {
		state[i + '_' + 'noise.type'] = set.noise.type
		state[i + '_' + 'pan.type'] = set.pan.type
		state[i + '_' + 'volume.volume.value'] = set.volume.volume.value
		state[i + '_' + 'pan.frequency.value'] = set.pan.frequency.value
		state[i + '_' + 'mod.frequency.value'] = set.mod.frequency.value
		state[i + '_' + 'mod.volume.value'] = set.mod.volume.value
	})

	addPresetToURL(state)
	printValues(state)
}

function setValues(state, sets, controls){
	Object.keys(state).map(item => {
		let index = item.split('_')[0], paramList = item.slice(2).split('.')

		if(paramList[2]){
			sets[index][paramList[0]][paramList[1]][paramList[2]] = state[item]
		} else {
			sets[index][paramList[0]][paramList[1]] = state[item]
		}
		if(paramList[1] === 'volume'){
			controls[paramList[0] + '.' + letters[index]] = state[item]
		} else {
			controls[paramList[0] + '.' + paramList[1] + '.' + letters[index]] = state[item]
		}

	//console.log('::', ...paramList, '<>', state[item])
	})
	addPresetToURL(state)
}

function addPresetToURL(state) {
	history.pushState(null, null, '#' + encodeURIComponent(JSON.stringify(state)));
}

function readPresetFromURL(){
	return JSON.parse(decodeURIComponent(document.location.hash.slice(1)));
}

function getTinyURL(state) {
	var url = document.location.protocol + "//" + document.location.host + document.location.pathname + "#" + encodeURIComponent(JSON.stringify(state));
	url = encodeURIComponent(url);

	window.open("http://tinyurl.com/api-create.php?url=" + url, "_blank", "width=300,height=100");
}

function saveStateToLocal(name){
	localStorage.setObject(name, state)
}

function getStoredPresets() {
	return Object.keys(localStorage)
}

function printValues(state){
	console.log('\n')
	Object.keys(state).forEach( item => {
		let value = (isNaN(state[item])) ? state[item] : Number(state[item])

		console.log(item + ': ', value)
	})
}

Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  return JSON.parse(this.getItem(key));
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
