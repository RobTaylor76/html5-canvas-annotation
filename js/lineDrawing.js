/* http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html

<canvas id="sig-canvas" width="320" height="160">
    Get a better browser, bro.
</canvas>
*/


var LineDrawing = function(config) {
    this.setConfig(config);
};


LineDrawing.prototype.setConfig = function(customConfig) {

    this.config = customConfig;

    if (!this.config.strokeStyle) {
        this.config.strokeStyle = "#222222";
    }

    if ( (!this.config.lineWidth) || (this.config.lineWidth<1) ) {
        this.config.lineWidth = 2;
    }
};


LineDrawing.prototype.attachToCanvas = function(canvas) {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d");
    this.canvasContext.strokeStyle = this.config.strokeStyle;
    this.canvasContext.lineWidth = this.config.lineWidth;

    var This = this;

    canvas.addEventListener("mousedown", function (e) {
        e.preventDefault();
        This.drawing = true;
        This.lastPos = This.getMousePos(e);
        This.mousePos = This.lastPos;
        This.canvasContext.beginPath();
    }, false);

    canvas.addEventListener("mouseup", function (e) {
        e.preventDefault();
        This.drawing = false;
        This.canvasContext.closePath();
    }, false);

    canvas.addEventListener("mousemove", function (e) {
        e.preventDefault();
        This.mousePos = This.getMousePos(e);
    }, false);

    // Set up touch events for mobile, etc
    canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        var touchPos = This.getTouchPos(e);
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touchPos.x,
            clientY: touchPos.y
        });
        This.canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchend", function (e) {
        e.preventDefault();
        var mouseEvent = new MouseEvent("mouseup", {});
        This.canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        var touchPos = This.getTouchPos(e);
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touchPos.x,
            clientY: touchPos.y
        });
        This.canvas.dispatchEvent(mouseEvent);
    }, false);

   var animateCallback  = function() {
       requestAnimationFrame(animateCallback);
       This.renderCanvas();
   };
   requestAnimationFrame(animateCallback);
};

// Get the position of the mouse relative to the canvas
LineDrawing.prototype.getMousePos = function(mouseEvent) {
    var rect = this.canvas.getBoundingClientRect();
 //   var rect = this.getCanvasPosition();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
};

// Draw to the canvas
LineDrawing.prototype.renderCanvas = function() {
    if (this.drawing) {
        this.canvasContext.moveTo(this.lastPos.x, this.lastPos.y);
        this.canvasContext.lineTo(this.mousePos.x, this.mousePos.y);
        this.canvasContext.stroke();
        this.lastPos = this.mousePos;
    }
};

// Get the position of a touch relative to the canvas
LineDrawing.prototype.getTouchPos = function(touchEvent) {
//    var rect = this.canvas.getBoundingClientRect();

   // var rect = this.getCanvasPosition();
    return {
        x: touchEvent.touches[0].clientX, //- rect.left,
        y: touchEvent.touches[0].clientY //- rect.top
    };
};



LineDrawing.prototype.getCanvasPosition = function() {
    var xPosition = 0;
    var yPosition = 0;

    var element = this.canvas;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
};

LineDrawing.prototype.setColor = function(colour) {
    this.config.strokeStyle = colour;
    this.canvasContext.strokeStyle = this.config.strokeStyle;
};

LineDrawing.prototype.setLineWidth = function(lineWidth) {
    this.config.lineWidth = lineWidth;
    this.canvasContext.lineWidth = this.config.lineWidth;
};

LineDrawing.prototype.clearCanvas = function() {
    this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height);
};


