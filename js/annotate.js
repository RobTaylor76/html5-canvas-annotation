var stage;
var pictureLayer;
var annotateLayer;
var combineLayer;

$(function() {
	createLayout();
	
	bindEvents();
	
	createAnnotateStage();
})

function createLayout() {
	var aHTML = [];
	aHTML.push(	'<h2>Select Picture or Take a Photo</h2>' +
				'<div>' + 
					'<input accept="image/*" id="takePictureInput" type="file" />' +
				'</div>' +
//				'<div id="imageContainer" style="display:none">' +
//					'<img id="yourImageSmall" alt="" />' +
//				'</div>' +
				'<h2>Annotate on Image</h2>' +
				'<div id="annotationDrawingTools"></div>' + 
				'<div id="myAnnotation"></div>' + 
				'<button id="combineButton">Combine</button>' + 
				'<h2>Final Image</h2>' +
				'<div id="myAnnotationResult"></div>');
				
	$('body').html(aHTML.join(''));			
}

function bindEvents() {
	$('body').on("change", "#takePictureInput", function(event){
		var f = event.target.files[0];
		resetFields();
		
		// Only process image files.
		if(!f.type.match('image.*')) {
			
		}
		else {
			var reader = new FileReader();
			// Closure to capture the file information.
			reader.onload = function(e) {
				var dataURL = reader.result;
			//	$('#yourImageSmall').attr('src', dataURL);
				
				var imageObj = new Image();
				imageObj.onload = function() {
					var loadedImage = new Kinetic.Image({
						x: 0,
						y: 0,
						image: imageObj,
						width: 800,
						height: 600
					});
					
					//Add the image to the pictureLayer
					pictureLayer.add(loadedImage);
					
					//Add the pictureLayer to the stage
					stage.add(pictureLayer);
					
					//Add the annotateLayer to the stage
					stage.add(annotateLayer);
					
					var drawinglayer = $('#myAnnotation canvas').eq(1);
					drawinglayer.attr('id', 'annotationdrawing');
					//drawinglayer.css({ 'height': '', 'width': ''});
					drawinglayer.sketch({
						defaultSize: '2',
						defaultColor: 'yellow'
					});
					
					$.each(['#000', '#fff', '#ffff00'], function() {
						$('#annotationDrawingTools').append("<a href='#annotationdrawing' data-color='" + this + "' style='background: " + this + "; width: 20px; display:inline-block; text-decoration: none;'>&nbsp;</a> ");
					});
					$.each([1, 3, 6, 9, 12], function() {
						$('#annotationDrawingTools').append("<a href='#annotationdrawing' data-size='" + this + "' style='font-weight: bold; background: #ccc; text-align: center; text-decoration: none;'>" + this + "</a> ");
					});
				}
				imageObj.src = dataURL;
			};
		}
		
		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	});
	
	$('body').on("click", "#combineButton", function(event){
		
		var imageObj = new Image();
		imageObj.onload = function() {
			var loadedImage = new Kinetic.Image({
				  x: 0,
				  y: 0,
				  image: imageObj,
				  width: 800,
				  height: 600
			});
			combineLayer.add(loadedImage);
			
			stage.add(combineLayer);
			
			stage.toDataURL({
			  callback: function (dataUrl) {
					$('#myAnnotationResult').html('<img src="' + dataUrl + '" />');
				}
			});
		}
		imageObj.src = $('#myAnnotation canvas')[1].toDataURL();
	});
}

function createAnnotateStage() {
	//Create the new Stage
	stage = new Kinetic.Stage({
        container: "myAnnotation",
        width: 800,
        height: 600
    });

	//Create a new layer where the picture / photo
	pictureLayer = new Kinetic.Layer();
	
	//Create another layer the drawing will be added to
	annotateLayer = new Kinetic.Layer();

	//This layer will be used mainly to demonstate the combining of the two layers to one
	combineLayer = new Kinetic.Layer();
}

function resetFields() {
	$('#annotationDrawingTools').html('');
	$('#myAnnotationResult').html('');
	$('#myAnnotation').html('');
	createAnnotateStage();
}