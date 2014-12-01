// by @greweb
// Experimenting with Frequency Modulation + Filter Cutoff
// http://greweb.me/2013/08/FM-audio-api/
// http://forresto.github.io/dataflow-webaudio/
var context = new AudioContext();

function Modulator (type, freq, gain) {
  this.modulator = context.createOscillator();
  this.gain = context.createGain();
  this.modulator.type = type;
  this.modulator.frequency.value = freq;
  this.gain.gain.value = gain;
  this.modulator.connect(this.gain);
  this.modulator.start(0);
}

// Make a stack of modulator
var modulatorStackNode = [
    new Modulator("sawtooth", 0.01*Math.random(), 200*Math.random()),
    new Modulator("square", 0.1*Math.random(), 200*Math.random()),
    new Modulator("sine", 1*Math.random(), 200*Math.random()),
    new Modulator("square", 10*Math.random(), 200*Math.random()),
    new Modulator("sine", 100*Math.random(), 200*Math.random())
].reduce(function (input, output) {
    input.gain.connect(output.modulator.frequency);
    return output;
});

// Make an oscillator, connect the modulator stack, play it!
var osc = context.createOscillator();
osc.type = "sine";
osc.frequency.value = 100+400*Math.random();
modulatorStackNode.gain.connect(osc.frequency);

var filter = context.createBiquadFilter();
filter.frequency.value = 2000;
filter.Q.value = 10;
osc.connect(filter);
filter.connect(context.destination);

osc.start(0);