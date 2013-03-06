
var container, stats;

var camera, scene, renderer;

var cube, plane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouseDownX, mouseDownY;

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1300 );

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	
	container.appendChild( info );

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.z = 1200;

	scene = new THREE.Scene();
	
	console.log("Load scene");
	createScene();
	console.log("Loaded scene");
	
	// setup renderer
//	renderer = new THREE.CanvasRenderer();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

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
	for (var i = 20; i < 250; i++)
	{	
		for (var j = 20; j < 250; j++)
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
	if(block.Left != undefined && block.Left.wall != 0)
	{
		CreateEdge(x, y, z, block.Left, FaceType.Left);
	}
	
	if(block.Right != undefined && block.Right.wall != 0)
	{
		CreateEdge(x, y, z, block.Right, FaceType.Right);
	}
	
	if(block.Top != undefined && block.Top.wall != 0)
	{
		CreateEdge(x, y, z, block.Top, FaceType.Top);
	}
	
	if(block.Bottom != undefined && block.Bottom.wall != 0)
	{
		CreateEdge(x, y, z, block.Bottom, FaceType.Bottom);
	}
	
	if(block.Lid != undefined && block.Lid.tileNumber != 0)
	{
		CreateEdge(x, y, z, block.Lid, FaceType.Lid);
	}
}

var levelXOffset = -85;
var levelYOffset = -190;
var cnt = 0;
function CreateEdge(x, y, z, face, type)
{
	var material;
	
	if(face.tileNumber == undefined) {
		color = 0xFF00FF;
		material = new THREE.MeshBasicMaterial( { color: color} );
	}
	else {
		var texture = new THREE.Texture(style.tiles[face.tileNumber]);
		texture.needsUpdate = true;
		
		material = new THREE.MeshBasicMaterial( { map: texture } );	
	}

	wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
		
	var edge;
	if(type == FaceType.Lid)
	{
		edge = new THREE.SceneUtils.createMultiMaterialObject(lidGeometry.clone(), [material,/* wireMaterial*/]);
		//debugger;
		//edge = new THREE.Mesh(new THREE.PlaneGeometry( tileSize, tileSize), material);
	}
	else
	{

		edge = new THREE.SceneUtils.createMultiMaterialObject(edgeGeometry.clone(), [material, /*wireMaterial*/]);
		//edge = new THREE.Mesh(edgeGeometry, material);
		//debugger;
	}
	
	var x = (x + levelXOffset) * tileSize;
	var y = (y + levelYOffset) * tileSize;
	var z = z * tileSize;
	
	if(type == FaceType.Left)
	{
		x -= tileSize / 2;
		Rotate(edge, 0, 0, 90);
	}
	else if(type == FaceType.Right)
	{
		x += tileSize / 2;
		Rotate(edge, 0, 0, -90);
	}
	else if(type == FaceType.Top)
	{
		y -= tileSize / 2;
	}
	else if(type == FaceType.Bottom)
	{
		y += tileSize / 2;
		Rotate(edge, 0, 0, 180);
	}
	else if(type == FaceType.Lid)
	{
		//Rotate(edge, 0, 0, face.rotation);

		z += tileSize / 2;
	}
	
	RotateUV(edge.children[0].geometry, face.rotation);
	
	if(face.flip == 1)
		MirrorUV(edge.children[0].geometry, 'y');
		
	edge.position.x = x;
	edge.position.y = -y;	
	edge.position.z = z;

	scene.add(edge);	
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

	renderer.render( scene, camera );

	// camera.position.y = Math.sin(Date.now()/1000)*50;
	// camera.position.x = Math.cos(Date.now()/1000)*50;
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