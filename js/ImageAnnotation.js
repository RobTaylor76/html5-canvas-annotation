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

    this.coveringCanvasId = this.elementGUID();
    this.coveredCanvasId = this.elementGUID();
    this.canvasWrapperDivId = this.elementGUID();
    this.annotationDrawingToolsDivId = this.elementGUID();

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

    if ((!this.config.maxImageWidth)|| (this.config.maxImageWidth<640) ) {
        this.config.maxImageWidth = 1024;
    }

    if ((!this.config.imageQuality)|| (this.config.imageQuality < 0.5) ) {
        this.config.imageQuality = 0.75;
    }

    this.canvasLineDrawing = new CanvasLineDrawing({strokeStyle: this.config.strokeStyle,lineWidth: this.config.lineWidth});


    //this.config.imageAnnotationContainerId = this.config.ImageAnnotation
};

ImageAnnotation.prototype.createElements = function() {
    // image rotation
    var $container = $(this.config.imageAnnotationContainerId);

    var $drawingToolsDiv = $("<div>", {id: this.annotationDrawingToolsDivId});

    $container.append($drawingToolsDiv);
    $('#'+this.annotationDrawingToolsDivId).hide();

    var $rotClockwise = $("<a>", {href: "#", "data-action":"rotateClockwise"}).text("Rotate Right");
    var $rotCounterClockwise = $("<a>", {href: "#", "data-action":"rotateCounterClockwise"}).text("Rotate Left");

    $drawingToolsDiv.append($rotCounterClockwise);
    $drawingToolsDiv.append($rotClockwise);

    $drawingToolsDiv.find("a[data-action='rotateClockwise']").click(function(event){
        event.preventDefault();
        This.rotateCanvases(90);
    });

    $drawingToolsDiv.find("a[data-action='rotateCounterClockwise']").click(function(event){
        event.preventDefault();
        This.rotateCanvases(270);
    });

    $.each(['#000', '#fff', '#ffff00',"#de000e"], function() {
        $drawingToolsDiv.append("<a href='#' data-color='" + this + "' style='background: " + this + "; width: 20px; display:inline-block; text-decoration: none;'>&nbsp;</a> ");

    });
    $.each([1, 3, 5], function() {
        $drawingToolsDiv.append("<a href='#' data-size='" + this + "' style='font-weight: bold; background: #ccc; text-align: center; text-decoration: none;'>" + this + "</a> ");
    });

    var This = this;

    $drawingToolsDiv.find('a[data-color]').on("click",  function(event) {
        event.preventDefault();
        var color = $(event.target).data('color');
        This.canvasLineDrawing.setColor(color);
    });


    $drawingToolsDiv.find('a[data-size]').on("click",  function(event) {
        event.preventDefault();
        var size = $(event.target).data('size');
        This.canvasLineDrawing.setLineWidth(size);
    });


    $drawingToolsDiv.append($("<a>", {href: "#", "data-action":"resetCanvas"}).text("Reset"));

    $drawingToolsDiv.find("a[data-action='resetCanvas']").on("click",  function(event) {
        event.preventDefault();
        This.canvasLineDrawing.clearCanvas();
    });

    var $outside = $("<div>");
    var $inside = $("<div>", {id: this.canvasWrapperDivId, "style": "position:relative;" });

    $outside.append($inside);
    $drawingToolsDiv.append($outside);

};

ImageAnnotation.prototype.drawCanvases = function(canvas) {

    this.removeCanvases();

    //'<img id="loadedImage" class="coveredImage">' +
    canvas.id = this.coveredCanvasId;
    canvas.style= "position:absolute;top:0px;left:0px;z-index:1;";

    var $insideWrapper = $("#"+this.canvasWrapperDivId);

    $insideWrapper.append(canvas);

    var coverCanvas = $("<canvas>")
        .attr({
            width: canvas.width,
            height: canvas.height,
            style: "position:relative;z-index:20;",
            id: this.coveringCanvasId
        });

    $insideWrapper.append(coverCanvas);

    this.canvasLineDrawing.attachToCanvas(coverCanvas.get(0));

    $('#'+this.annotationDrawingToolsDivId).show();
};

ImageAnnotation.prototype.removeCanvases = function() {
    $("#"+this.coveredCanvasId).remove(); // replace the canvas if it exists ...
    $("#"+this.coveringCanvasId).remove(); // replace the canvas if it exists ...
};

ImageAnnotation.prototype.handleFileSelection = function(file) {

    this.removeCanvases();

    var resizer = new ImageResizer({
        maxWidth: this.config.maxImageWidth,
        quality: this.config.imageQuality,
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

    var coveredCanvas =  $("#"+this.coveredCanvasId)[0];

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
    var coveredCanvas = $("#"+this.coveredCanvasId)[0];

    var canvas = $("<canvas>").attr({
        width: coveredCanvas.width,
        height: coveredCanvas.height
    })[0];

    var context = canvas.getContext("2d");

    context.drawImage(coveredCanvas, 0, 0);

    var coverCanvas = $("#"+this.coveringCanvasId)[0];

    context.drawImage(coverCanvas, 0, 0);

    return canvas;
};

ImageAnnotation.prototype.elementGUID = function() {
    return this.randomString() + this.randomString() + '-' + this.randomString() + '-' + this.randomString(); // + '-' +
       // randomString() + '-' + randomString() + randomString() + randomString();
};

ImageAnnotation.prototype.randomString = function(){
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};