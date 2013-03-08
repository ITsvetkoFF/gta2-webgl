

var container, stats;

var camera, scene, renderer;

var cube, plane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouseDownX, mouseDownY;
alert("test");
function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1500);
	camera.position.z = 600;
	camera.position.x = startCamPosition[0] * tileSize;
	camera.position.y = startCamPosition[1] * tileSize;

	scene = new THREE.Scene();
	
	console.log("Load scene");
	createScene();

	console.log("Loaded scene");
	
	// setup renderer

	//renderer = new THREE.CanvasRenderer();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColorHex(0xff0000, 1);

	container.appendChild( renderer.domElement );


	//default stats  component
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	window.addEventListener( 'resize', onWindowResize, false );
}

function createScene()
{	
    for (var i = drawLevelArea[1]; i < drawLevelArea[3]; i++)
	{	
        for (var j = drawLevelArea[0]; j < drawLevelArea[2]; j++)
		{		
			for (var k = 0; k < 8; k++)
			{
				var block = level.map[i][j][k];
				
				if(block != undefined)
				{ 
					CreateBlock(i, j, k, block);			
				}
			}
		}
	}
}

var tileSize = 64;

//Lid Geometry
var lidGeometry = new THREE.PlaneGeometry( tileSize, tileSize);

//Edge Geometry
var edgeGeometry = new THREE.Geometry(); 
var v1 = new THREE.Vector3(-tileSize/2, 0, -tileSize/2);
var v2 = new THREE.Vector3(tileSize/2, 0, -tileSize/2);
var v3 = new THREE.Vector3(tileSize/2, 0, tileSize/2);
var v4 = new THREE.Vector3(-tileSize/2, 0, tileSize/2);

edgeGeometry.vertices.push(v1);
edgeGeometry.vertices.push(v2);
edgeGeometry.vertices.push(v3);
edgeGeometry.vertices.push(v4);

edgeGeometry.faces.push( new THREE.Face4( 3, 2, 1, 0));
	
var faceuv = [
	new THREE.Vector2(1, 1),	
	new THREE.Vector2(0, 1),
	new THREE.Vector2(0, 0),
	new THREE.Vector2(1, 0)
	
];

edgeGeometry.faceVertexUvs[0].push(faceuv); 
edgeGeometry.computeFaceNormals();

function CreateBlock(x, y, z, block)
{

    if (block.Left != undefined && block.Left.tileNumber != 0)
	{
	    CreatePolygon(x, y, z, block.Left, FaceType.Left, block);
	}
	
	if (block.Right != undefined && block.Right.tileNumber != 0)
	{
	    CreatePolygon(x, y, z, block.Right, FaceType.Right, block);
	}
	
	if (block.Top != undefined && block.Top.tileNumber != 0)
	{
	    CreatePolygon(x, y, z, block.Top, FaceType.Top, block);
	}
	
	if (block.Bottom != undefined && block.Bottom.tileNumber != 0)
	{
		CreatePolygon(x, y, z, block.Bottom, FaceType.Bottom, block);
	}
	
	if(block.Lid != undefined && block.Lid.tileNumber != 0)
	{
	    CreatePolygon(x, y, z, block.Lid, FaceType.Lid, block);
    }
}

var tileCache = new Array();

function getTile(tileNo) {
    var cache = tileCache[tileNo];
    if (cache != undefined)
        return cache;

    var texture = new THREE.Texture(style.tiles[tileNo]);
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

    tileCache[tileNo] = material;

    return material;

}

var cnt = 0;
function CreatePolygon(x, y, z, face, type, block)
{
    var material;
    if (face.tileNumber == undefined) {
        return;
        color = 0xFF00FF;

        material = new THREE.MeshBasicMaterial({ color: color });
    }
    else {
        material = getTile(face.tileNumber);
    }
	var geometry;
	
	if (type == FaceType.Lid) {
	    geometry = CreateLid(new THREE.Vector2(tileSize / 2, -tileSize / 2), block.slopeType);
	}
	else if (block.slopeType == SlopeType.DiagonalFacingDownRight && (type == FaceType.Bottom || type == FaceType.Right)) { // down right
		geometry = CreateEdge(new THREE.Vector2(tileSize/2, tileSize/2), new THREE.Vector2(-tileSize, -tileSize));
	}
	else if (block.slopeType == SlopeType.DiagonalFacingDownLeft && (type == FaceType.Bottom || type == FaceType.Left)) { // down left
	    geometry = CreateEdge(new THREE.Vector2(tileSize / 2, -tileSize / 2), new THREE.Vector2(-tileSize, tileSize));
	}
	else if (block.slopeType == SlopeType.DiagonalFacingUpRight && (type == FaceType.Top || type == FaceType.Right)) {  // up right
	    geometry = CreateEdge(new THREE.Vector2(-tileSize / 2, tileSize / 2), new THREE.Vector2(tileSize, -tileSize));
	}
	else if (block.slopeType == SlopeType.DiagonalFacingUpLeft && (type == FaceType.Top || type == FaceType.Left)) {  // up left
	    geometry = CreateEdge(new THREE.Vector2(-tileSize / 2, -tileSize / 2), new THREE.Vector2(tileSize, tileSize));
	}
	else if (type == FaceType.Top)
	{
		geometry = CreateEdge(new THREE.Vector2(-tileSize/2, tileSize/2), new THREE.Vector2(tileSize, 0));
	}
	else if(type == FaceType.Bottom)
	{
		geometry = CreateEdge(new THREE.Vector2(tileSize/2, -tileSize/2), new THREE.Vector2(-tileSize, 0));
	}
	else if(type == FaceType.Left)
	{
	    geometry = CreateEdge(new THREE.Vector2(-tileSize / 2, -tileSize / 2), new THREE.Vector2(0, tileSize));
	}
	else if(type == FaceType.Right)
	{
		geometry = CreateEdge(new THREE.Vector2(tileSize/2, tileSize/2), new THREE.Vector2(0, -tileSize));
	}

	var materialList = [material];
	if(showWireframe) {
	    wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
	    materialList.push(wireMaterial);
	}
	var edge = new THREE.SceneUtils.createMultiMaterialObject(geometry, materialList);
	
	
	var x = x * tileSize;
	var y = y * tileSize;
	var z = z * tileSize;
		
	RotateUV(edge.children[0].geometry, face.rotation);
	
	if (face.flip == 1) {
	    if (type == FaceType.Lid) {
	        MirrorUV(edge.children[0].geometry, 'x');
	    } else {
	        MirrorUV(edge.children[0].geometry, 'y');
	    }
	}
		
	edge.position.x = x;
	edge.position.y = -y;
	edge.position.z = z;
	scene.overdraw = true;

	scene.add(edge);	
}


function CreateLid(start, slopeType)
{
    var v1 = new THREE.Vector3(start.x, start.y, tileSize / 2);
    var v2 = new THREE.Vector3(start.x - tileSize, start.y, tileSize / 2);
    var v3 = new THREE.Vector3(start.x - tileSize, start.y + tileSize, tileSize / 2);
    var v4 = new THREE.Vector3(start.x, start.y + tileSize, tileSize / 2);

    if (slopeType == 7 || slopeType == 8) {
        if (slopeType == 8) {
            v1.z += tileSize / 2;
            v2.z += tileSize / 2;
            v3.z += tileSize / 2;
            v4.z += tileSize / 2;
        }
        v1.z -= tileSize / 2;
        v2.z -= tileSize;
        v3.z -= tileSize;
        v4.z -= tileSize / 2;
    }

    if (slopeType == 5 || slopeType == 6) {
        if (slopeType == 6) {
            v1.z += tileSize / 2;
            v2.z += tileSize / 2;
            v3.z += tileSize / 2;
            v4.z += tileSize / 2;
        }
        v1.z -= tileSize;
        v2.z -= tileSize / 2;
        v3.z -= tileSize / 2;
        v4.z -= tileSize;
    }

    if (slopeType == 1 || slopeType == 2) {
        if (slopeType == 2) {
            v1.z += tileSize / 2;
            v2.z += tileSize / 2;
            v3.z += tileSize / 2;
            v4.z += tileSize / 2;
        }
        v1.z -= tileSize;
        v2.z -= tileSize;
        v3.z -= tileSize / 2;
        v4.z -= tileSize / 2;
    }

    if (slopeType == 3 || slopeType == 4) {
        if (slopeType == 4) {
            v1.z += tileSize / 2;
            v2.z += tileSize / 2;
            v3.z += tileSize / 2;
            v4.z += tileSize / 2;
        }
        v1.z -= tileSize / 2;
        v2.z -= tileSize / 2;
        v3.z -= tileSize;
        v4.z -= tileSize;
    }

    var geometry = CreateFace(v1, v2, v3, v4);
    return geometry;
}

function CreateEdge(start, span)
{
	var v1 = new THREE.Vector3(start.x, start.y, -tileSize/2);
	var v2 = new THREE.Vector3(start.x + span.x, start.y + span.y, -tileSize/2);
	var v3 = new THREE.Vector3(start.x + span.x, start.y + span.y, tileSize/2);
	var v4 = new THREE.Vector3(start.x, start.y, tileSize/2);

	var geometry = CreateFace(v1, v2, v3, v4);
	return geometry;
}

function CreateFace(v1, v2, v3, v4)
{
	//Edge Geometry
	var g = new THREE.Geometry(); 
	
	g.vertices.push(v1);
	g.vertices.push(v2);
	g.vertices.push(v3);
	g.vertices.push(v4);
	
	g.faces.push( new THREE.Face4( 3, 2, 1, 0));
		
	var faceuv = [
		new THREE.Vector2(1, 1),	
		new THREE.Vector2(0, 1),
		new THREE.Vector2(0, 0),
		new THREE.Vector2(1, 0)	
	];
	
	g.faceVertexUvs[0].push(faceuv); 
	g.computeFaceNormals();
	
	return g;
}

function Rotate(target, x, y, z)
{
	if(x != 0)
		target.rotation.x += (x / 360) * (Math.PI*2);
	
	if(y != 0)
		target.rotation.y += (y / 360) * (Math.PI*2);
	
	if(z != 0)
		target.rotation.z += (z / 360) * (Math.PI*2);
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseDownX = event.clientX;
	mouseDownY = event.clientY;
}

function onDocumentMouseMove( event ) {

	diffX = event.clientX - mouseDownX;
	diffY = event.clientY - mouseDownY;
	
	mouseDownX = event.clientX;
	mouseDownY = event.clientY;
	

	camera.position.y += diffY*3;
	camera.position.x -= diffX*3;

}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();



	}

}

function onDocumentTouchMove( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();


	}

}

//
function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {
	physicsUpdate();
	
	renderer.render( scene, camera );
	
}

function RotateUV(target, value)
{
	if(value == 0) return;

	var uvs = target.faceVertexUvs[0][0];
	
	if(value == 90)
	{
		uvs.push(uvs.shift());
	}
	else if(value == 180 || value == -180)
	{
		uvs.push(uvs.shift());
		uvs.push(uvs.shift());
	}
	else if(value == 270 || -90)
	{
		uvs.unshift(uvs.pop());
	}
	
	target.faceVertexUvs[0][0] = uvs;
	target.uvsNeedUpdate = true;
}

function MirrorUV(target, value)
{
	var uvs = target.faceVertexUvs[0][0];
			
	if(value == 'y')
	{
		//Y mirror
		uvs.reverse();
	}
	else
	{
		//x mirror
		uvs.reverse();
		var f = uvs.shift();
		uvs.push(f);
		var f = uvs.shift();
		uvs.push(f);
	}
	
	target.uvsNeedUpdate = true;
}