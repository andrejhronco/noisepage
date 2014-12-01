REFRESH_RATE = 30;
VOLUME = 0.5;

var audioCtx;
var destination;
var carrier, modulator, lspectrum, rspectrum, lwaveform, rwaveform;
function demo () { // this could be my done/success callback
    destination = audioCtx.createGain();
    destination.gain.value = VOLUME;
    destination.connect(audioCtx.destination);

    // Config of the demo
    carrier   = new Carrier("sine", 280);
    modulator = new Modulator("sine", 280, 280);
    lspectrum = new SpectrumAnalyzer(modulator.osc, 0, 500);
    rspectrum = new SpectrumAnalyzer(carrier.gain, 0, 1000);
    lwaveform = new WaveformAnalyzer(modulator.osc, 512);
    rwaveform = new WaveformAnalyzer(carrier.gain, 512);

    modulator.gain.connect(carrier.osc.frequency);
    carrier.gain.gain.value = 0;
    carrier.gain.connect(destination);
}
    
var renderInterval;

// A modulator has an oscillator and a gain
function Modulator (type, freq, gain) {
  this.osc = audioCtx.createOscillator();
  this.gain = audioCtx.createGain();
  this.osc.type = type;
  this.osc.frequency.value = freq;
  this.gain.gain.value = gain;
  this.osc.connect(this.gain);
  this.osc.start(0);
}
Modulator.prototype.toString = function () {
    return "freq="+this.osc.frequency.value.toFixed(1)+
          " amp="+this.gain.gain.value.toFixed(0);
}

function Carrier (type, freq) {
  this.osc = audioCtx.createOscillator();
  this.gain = audioCtx.createGain();
  this.osc.type = type;
  this.osc.frequency.value = freq;
  this.osc.connect(this.gain);
  this.osc.start(0);
}

Carrier.prototype.toString = function () {
    return "freq="+this.osc.frequency.value.toFixed(1)+
          " amp="+this.gain.gain.value.toFixed(1);
}

function SpectrumAnalyzer (audioNode, minRange, maxRange) {
    this.audioNode = audioNode;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.maxDecibels = 0;
    this.analyser.minDecibels = -100;
    this.array = new Float32Array(this.analyser.frequencyBinCount);
    this.minRange = minRange ||  0;
    this.maxRange = maxRange ||  audioCtx.sampleRate;
    audioNode.connect(this.analyser);
}
SpectrumAnalyzer.prototype = {
    update: function () {
        this.analyser.getFloatFrequencyData(this.array);
    },
    render: function (ctx) {
        var length = this.array.length;
        var fftSize = this.analyser.fftSize;
        var W = ctx.canvas.width;
        var H = ctx.canvas.height;
        var minDb = this.analyser.minDecibels;
        var maxDb = this.analyser.maxDecibels;
        var fy = function (y) {
            y = (y-minDb)/(maxDb-minDb); // normalize
            return (1-y) * H;
        }
        ctx.clearRect(0,0,W,H);
        ctx.beginPath();
        ctx.fillStyle = "#acd";
        ctx.moveTo(0, H);
        var iStart = Math.floor(fftSize*this.minRange/audioCtx.sampleRate);
        var iStop = Math.floor(fftSize*this.maxRange/audioCtx.sampleRate);
        var range = iStop-iStart;
        for (var i=iStart; i<=iStop; ++i) {
            ctx.lineTo(W*(i-iStart)/range, fy(this.array[i]));
        }
        ctx.lineTo(W, H);
        ctx.fill();
        
        var step = GridUtils.findNiceRoundStep(this.maxRange, 4);
        var prefix = step>=1000 ? "k" : "";
        ctx.fillStyle = "#357";
        for (var i=this.minRange+step; i<this.maxRange; i+=step) {
            var text = prefix=="k" ? Math.round(i/1000) : i;
            var x = W*i/this.maxRange;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 5);
            ctx.stroke();
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "14px sans-serif";
            ctx.fillText(text, x, 6);
        }
        ctx.textAlign = "right";
        ctx.fillStyle = "#79b";
        ctx.fillText("freq in "+prefix+"Hz", W, 20);
        ctx.font = "14px sans-serif";
    }
};

function WaveformAnalyzer (audioNode, sampling) {
    this.audioNode = audioNode;
    this.analyser = audioCtx.createAnalyser();
    this.setSampling(sampling);
    audioNode.connect(this.analyser);
}
WaveformAnalyzer.prototype = {
    setSampling: function (sampling) {
        this.array = new Uint8Array(sampling||256);
    },
    update: function () {
        this.analyser.getByteTimeDomainData(this.array);
    },
    render: function (ctx) {
        var length = this.array.length;
        var W = ctx.canvas.width;
        var H = ctx.canvas.height;
        var fy = function (y) {
            y = y/256; // normalize
            return (0.1+0.8*y) * H;
        }
        ctx.clearRect(0,0,W,H);
        ctx.beginPath();
        ctx.strokeStyle = "#acd";
        ctx.moveTo(0, fy(this.array[0]));
        for (var i=0; i<length; ++i) {
            ctx.lineTo(W*i/length, fy(this.array[i]));
        }
        ctx.stroke();
        
        var interval = length/audioCtx.sampleRate;
        var step = GridUtils.findNiceRoundStep(interval, 4);
        ctx.fillStyle = "#357";
        for (var i=step; i<interval; i+=step) {
            var text = i*1000;
            var x = W*i/interval;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 5);
            ctx.stroke();
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "14px sans-serif";
            ctx.fillText(text, x, 6);
        }
        ctx.textAlign = "right";
        ctx.fillStyle = "#79b";
        ctx.fillText("time in ms", W, 20);
        ctx.font = "14px sans-serif";
        
    }
};


function update () {
    lspectrum.update();
    rspectrum.update();
    lwaveform.update();
    rwaveform.update();
    domupdate();
}

var leftcanvases = $('#left-module canvas');
var lctx1 = leftcanvases[0].getContext("2d");
var lctx2 = leftcanvases[1].getContext("2d");
var rightcanvases = $('#right-module canvas');
var rctx1 = rightcanvases[0].getContext("2d");
var rctx2 = rightcanvases[1].getContext("2d");
function render () {
    rspectrum.render(rctx1);
    lspectrum.render(lctx1);
    rwaveform.render(rctx2);
    lwaveform.render(lctx2);
}

function start () {
    if (!carrier) {
        demo();
        $(document).trigger("demo-ready");
    }
    $(".play").hide();
    $(".stop").show();
    
    carrier.gain.gain.value = 1;
    
    function loop() {
      update();
      render();
    }
    clearInterval(renderInterval);
    renderInterval = setInterval(loop, REFRESH_RATE);
}

function stop () {
    $(".stop").hide();
    $(".play").show();
    
    if (carrier) {
        carrier.gain.gain.value = 0;
    }
    
    clearInterval(renderInterval);
}

var infos = $('.infos');
function domupdate () {
    infos.eq(0).html(modulator.toString());
    infos.eq(1).html(carrier.toString());
}


GridUtils = function() {
  
  var log10 = Math.log(10.)
  function powOf10 (n) { 
    return Math.floor(Math.log(n)/log10) 
  }
 
  return {
    findNiceRoundStep: function (delta, preferedStep) {
      var n = delta / preferedStep;
      var p = powOf10(n);
      var p10 = Math.pow(10, p);
      var digit = n/p10;
 
      if(digit<1.5)
        digit = 1;
      else if(digit<3.5)
        digit = 2;
      else if(digit < 7.5)
        digit = 5;
      else {
        p += 1;
        p10 = Math.pow(10, p);
        digit = 1;
      }
      return digit * p10;
    }
  }
}();

// Binding
$(".play").click(function (e) { e.preventDefault(); start(); });
$(".stop").click(function (e) { e.preventDefault(); stop(); });
stop();
$(window).blur(stop);

$(document).on("demo-ready", function () {
    $('input[data-bind]').each(function () {
        var input = $(this);
        var param = eval(input.attr("data-bind"));
        var mapValueData = input.attr("data-mapValue");
        var mapValue = !mapValueData ? function(v){ return v } : new Function("return "+mapValueData);
        function sync () {
            param.value = mapValue(parseFloat(input.val(), 10));
            input.parent().find(".value").text(input.val());
        }
        input.on("input", sync);
        sync();
    });
});
