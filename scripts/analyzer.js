//analyse the frequency/amplitude of the incoming signal
let fft = new Tone.Analyser("fft", 32);
//get the waveform data for the audio
let waveform = new Tone.Analyser("waveform", 1024);

Tone.Master.fan(fft, waveform)

//the waveform data
var waveContext = document.querySelector('#screen').getContext("2d"),
    canvasWidth, canvasHeight, waveformGradient;

sizeCanvases();

function loop(){
	requestAnimationFrame(loop);
	//get the waveform valeus and draw it
	var waveformValues = waveform.analyse();
	drawWaveform(waveformValues);
}
loop();


function drawWaveform(values){
	//draw the waveform
	waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
	var values = waveform.analyse();
	waveContext.beginPath();
	waveContext.lineJoin = "round";
	waveContext.lineWidth = 1.5;
	waveContext.strokeStyle = waveformGradient;
	waveContext.moveTo(0, (values[0] / 255) * canvasHeight);
	for (var i = 1, len = values.length; i < len; i++){
		var val = values[i] / 255;
		var x = canvasWidth * (i / len);
		var y = val * canvasHeight;
		waveContext.lineTo(x, y);
		// waveContext.lineTo(x-val * 150, y+val * 150);
    // waveContext.ellipse(x, y, val * 5, val * 5, 45 * Math.PI/180, 0, 2 * Math.PI);
    // waveContext.save()
    // waveContext.translate(canvasWidth/2, canvasHeight/2)
    // waveContext.lineTo(y, x);
    // waveContext.restore()
	}
	waveContext.stroke();
}

function sizeCanvases(){
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	waveContext.canvas.width = canvasWidth;
	waveContext.canvas.height = canvasHeight;
	//make the gradient
	waveformGradient = waveContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
	waveformGradient.addColorStop(0, "maroon");
	waveformGradient.addColorStop(0.15, "#e8280d");
  waveformGradient.addColorStop(0.85, "#e8280d");
  waveformGradient.addColorStop(1, "maroon");
}
