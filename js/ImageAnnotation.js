/**
 * Created by rob on 27/06/17.
 *
 * Encapsulate the LineDrawing capability, the image reszing and also to tools such as rotate
 *
 * This will own the image, drawing tools and drawing canvas
 *
 * The caller will supply a div to contain the canvases
 *
 */

var ImageAnnotation = function(config) {
    this.setConfig(config);

    this.createElements();
};

ImageAnnotation.prototype.setConfig = function(customConfig) {

    this.config = customConfig;

    if (!this.config.strokeStyle) {
        this.config.strokeStyle = "#222222";
    }

    if ( (!this.config.lineWidth) || (this.config.lineWidth<1) ) {
        this.config.lineWidth = 2;
    }

    this.canvasLineDrawing = new CanvasLineDrawing({strokeStyle: this.config.strokeStyle,lineWidth: this.config.lineWidth});


    //this.config.imageAnnotationContainerId = this.config.ImageAnnotation
};

ImageAnnotation.prototype.createElements = function() {
    // image rotation
    var $container = $(this.config.imageAnnotationContainerId);

    var $drawingToolsDiv = $("<div>", {id: "annotationDrawingTools", "class": "a"});

    $container.append($drawingToolsDiv);
    $('#annotationDrawingTools').hide();

    var $rotClockwise = $("<button>", {id: "clockwise", "class": "a"}).text("Rotate Right");
    var $rotCounterClockwise = $("<button>", {id: "counterclockwise", "class": "a"}).text("Rotate Left");

    $drawingToolsDiv.append($rotCounterClockwise);
    $drawingToolsDiv.append($rotClockwise);

    $("#clockwise").click(function(){
        This.rotateCanvases(90);
    });

    $("#counterclockwise").click(function(){
        This.rotateCanvases(270);
    });

    $.each(['#000', '#fff', '#ffff00',"#de000e"], function() {
        $drawingToolsDiv.append("<a href='#annotationdrawing' data-color='" + this + "' style='background: " + this + "; width: 20px; display:inline-block; text-decoration: none;'>&nbsp;</a> ");

    });
    $.each([1, 3, 5], function() {
        $drawingToolsDiv.append("<a href='#annotationdrawing' data-size='" + this + "' style='font-weight: bold; background: #ccc; text-align: center; text-decoration: none;'>" + this + "</a> ");
    });

    var This = this;

    $('#annotationDrawingTools a[data-color]').on("click",  function(event) {
        var color = $(event.target).data('color');
        This.canvasLineDrawing.setColor(color);
    });

    $('#annotationDrawingTools a[data-size]').on("click",  function(event) {
        var size = $(event.target).data('size');
        This.canvasLineDrawing.setLineWidth(size);
    });

    $('#annotationDrawingTools').append("<a href='#annotationdrawing' id='resetCanvas'>Reset</a> ");

    $("#resetCanvas").on("click",  function(event) {
        This.canvasLineDrawing.clearCanvas();
    });

    var $outside = $("<div>", {id: "outsideWrapper" });
    var $inside = $("<div>", {id: "insideWrapper", "style": "position:relative;" });

    $outside.append($inside);
    $drawingToolsDiv.append($outside);

};

ImageAnnotation.prototype.drawCanvases = function(canvas) {

    this.removeCanvases();

    //'<img id="loadedImage" class="coveredImage">' +
    canvas.id = "coveredCanvas";
    canvas.style= "position:absolute;top:0px;left:0px;z-index:1;";

    var $insideWrapper = $(this.config.imageAnnotationContainerId).find('#insideWrapper');

    $insideWrapper.append(canvas);

    var coverCanvas = $("<canvas id='coverCanvas'>")
        .attr({
            width: canvas.width,
            height: canvas.height,
            style: "position:relative;z-index:20;"
        });

    $insideWrapper.append(coverCanvas);

    this.canvasLineDrawing.attachToCanvas(coverCanvas.get(0));

    $(this.config.imageAnnotationContainerId).find('#annotationDrawingTools').show();
};

ImageAnnotation.prototype.removeCanvases = function() {
    $(this.config.imageAnnotationContainerId).find("#coveredCanvas").remove(); // replace the canvas if it exists ...
    $(this.config.imageAnnotationContainerId).find("#coverCanvas").remove(); // replace the canvas if it exists ...
};

ImageAnnotation.prototype.handleFileSelection = function(file) {

    this.removeCanvases();

    var resizer = new ImageResizer({
        maxWidth: 1024,
        quality: 0.90,
        //timeout: 5000,
        debug : true
    });

    var This = this;

    var callBack = function(canvas) {
        This.drawCanvases(canvas);
    };

    resizer.handleFileSelection(file, callBack);
};

ImageAnnotation.prototype.rotateCanvases = function(degrees){

    canvas = document.createElement("canvas");

    var ctx=canvas.getContext("2d");

    var coveredCanvas =  $(this.config.imageAnnotationContainerId).find("#coveredCanvas")[0];

    if(degrees == 90 || degrees == 270) {
        canvas.width = coveredCanvas.height;
        canvas.height = coveredCanvas.width;
    } else {
        canvas.width = coveredCanvas.width;
        canvas.height = coveredCanvas.height;
    }

    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(degrees == 90 || degrees == 270) {
        ctx.translate(coveredCanvas.height/2,coveredCanvas.width/2);
    } else {
        ctx.translate(coveredCanvas.width/2,coveredCanvas.height/2);
    }
    ctx.rotate(degrees*Math.PI/180);
    ctx.drawImage(coveredCanvas,-coveredCanvas.width/2,-coveredCanvas.height/2);

    this.drawCanvases(canvas);

    // document.body.appendChild(canvas);
};

ImageAnnotation.prototype.getAnnotatedCanvas = function(degrees){
    var coveredCanvas = $(this.config.imageAnnotationContainerId).find("#coveredCanvas")[0];

    var canvas = $("<canvas>").attr({
        width: coveredCanvas.width,
        height: coveredCanvas.height
    })[0];

    var context = canvas.getContext("2d");

    context.drawImage(coveredCanvas, 0, 0);

    var coverCanvas = $(this.config.imageAnnotationContainerId).find("#coverCanvas")[0];

    context.drawImage(coverCanvas, 0, 0);

    return canvas;
};