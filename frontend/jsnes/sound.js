
var Sound = function Sound() {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var channels = 2;

    var frameCount = JSNES.PAPU.frameTime;

    var source = audioCtx.createBufferSource();
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    this.writeBuffer = function(buffer) {
        var arrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
        for(var i=0; i < buffer.length && i < arrayBuffer.length; i++) {
            arrayBuffer[i] = buffer[i];
        }
        source.buffer = arrayBuffer;
        source.start();
    }
}