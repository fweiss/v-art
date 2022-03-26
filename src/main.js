AFRAME.registerComponent('gridhelper2', {
    schema: {
        size: { default: 1 },
        divisions: { default: 10 },
        colorCenterLine: {default: 'red'},
        colorGrid: {default: 'black'}
    },

    init: function () {
        var plane = this.el.object3D;
        var data = this.data;
        var size = data.size
        var divisions = data.divisions;

        // force a square 1 meter grid
        const targetSize = this.el.width
        size = targetSize
        divisions = targetSize

        var colorCenterLine = data.colorCenterLine;
        var colorGrid = data.colorGrid;

        // size: total square size
        // number of divisions
        var gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
        gridHelper.name = "gridHelper2";
        let r = this.el.getAttribute('rotation')
        console.log(r)
        // gridHelper.rotation.set(0, THREE.Math.degToRad(45), 0)
        // gridHelper.rotation.set(0, 1, r.z)
        // let rotation = scene.rotation.clone()
        let x = THREE.Math.degToRad(90)
        let y = 0
        let z = 0
        gridHelper.rotation.set(x, y, z)
        // gridHelper.rotation.x = x
        // rotation = new THREE.Vector3(0, 0, 0)
        plane.add(gridHelper);
    },
    remove: function () {
        var scene = this.el.object3D;
        scene.remove(scene.getObjectByName("gridHelper2"));
    }
})

AFRAME.registerComponent('wall', {
    init: function () {
        const surface = document.createElement('a-plane')
        surface.setAttribute('color', '#b78487')
        surface.setAttribute('width', 8)
        surface.setAttribute('height', 4)
        surface.setAttribute('shadow', 'receive: true')
        surface.setAttribute('material', 'side: double')
        this.el.appendChild(surface)

        const baseboard = document.createElement('a-box')
        baseboard.setAttribute('color', '#815273')
        baseboard.setAttribute('width', 8)
        baseboard.setAttribute('height', 0.2)
        baseboard.setAttribute('depth', 0.1)
        baseboard.setAttribute('position', '0 -2 0')
        this.el.appendChild(baseboard)
    }
})
AFRAME.registerPrimitive('art-wall', {
    defaultComponents: {
        wall: { },
    }
})

AFRAME.registerComponent('work', {
    schema: {
        src: { default: '#oceanview' },
        size: {},
        position: {},
    },
    init: function() {
        const offsetfromwall = 0.05
        const image = document.createElement('a-image')
        image.setAttribute('src', this.data.src)
        image.setAttribute('width', 1.3) // fixme aspect ratio or scale from img
        image.setAttribute('height', 1)
        image.setAttribute('shadow', 'receive: true') // not needed
        this.el.object3D.position.setZ(offsetfromwall)
        this.el.appendChild(image)

        const description = document.createElement('a-text')
        description.value = "description"
        this.el.appendChild(description)

        const light = document.createElement('a-entity')
        light.setAttribute('light', 'type: spot; castShadow: true; angle: 15; color: #FFF; intensity: 0.6; penumbra: 0.8; target: #work2')
        const lightGrid = document.getElementById('lightGrid')
        lightGrid.appendChild(light)
        // light.setAttribute('position','3.211 5.170 -3.155')

        light.object3D.position.set(3.211, 5.170, -3.155)
        // this.el.sceneEl.object3D.add(this.el.object3D)
        const t = this.el.object3D.position
        // light.object3D.target.position.set(t.x, t.y, t.z)
        //<!--    <a-entity light="type: spot; castShadow: true; angle: 15; color: #FFF; intensity: 0.6; penumbra: 0.8; target: #work2" position="3.211 5.170 -3.155"></a-entity>-->

    },
    tick: function() {

    }
})
AFRAME.registerPrimitive('art-work', {
    defaultComponents: {
        work: {},
    },
    mappings: {
        src: 'work.src'
    },
})

// AFRAME.registerComponent('mirror', {
//     init: function() {
//         const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
//
//         // todo not global
//         sphereCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
//         sphereCamera.position.set(0, 100, 0);
//         this.el.sceneEl.object3D.add(sphereCamera);
//         let sphereMaterial = new THREE.MeshBasicMaterial( {envMap: sphereCamera.renderTarget} );
//     },
//     tick: function(x, y) {
//         sphereCamera.update( AFRAME.scenes[0].renderer, this.el.sceneEl.object3D );
//     }
// })

// https://github.com/alfa256/aframe-mirror-component
AFRAME.registerComponent('mirror', {
    schema: {
        resolution: { type:'number', default: 128},
        refraction: { type:'number', default: 0.95},
        color: {type:'color', default: 0xffffff},
        distance: {type:'number', default: 3000},
        interval: { type:'number', default: 1000},
        repeat: { type:'boolean', default: false}
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function(){
        this.counter = this.data.interval;

        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

        this.cam = new THREE.CubeCamera( 0.5, this.data.distance, cubeRenderTarget);
        this.el.object3D.add( this.cam );
        this.mirrorMaterial = new THREE.MeshBasicMaterial( { color: this.data.color, refractionRatio: this.data.refraction, envMap: this.cam.renderTarget.texture } );
        this.done = false;
        var mirrormat = this.mirrorMaterial;
        this.mesh = this.el.getObject3D('mesh');
        if(this.mesh){
            this.mesh.traverse( function( child ) {
                if ( child instanceof THREE.Mesh ) child.material = mirrormat;
            });
        }
    },

    tick: function(t,dt){
        if(!this.done){
            if( this.counter > 0){
                this.counter -= dt;
            } else {
                this.mesh = this.el.getObject3D('mesh');

                if (this.mesh) {
                    this.mesh.visible = false;
                    AFRAME.scenes[0].renderer.autoClear = true;
                    this.cam.position.copy(this.el.object3D.worldToLocal(this.el.object3D.getWorldPosition()));
                    this.cam.update( AFRAME.scenes[0].renderer, this.el.sceneEl.object3D );

                    var mirrormat = this.mirrorMaterial;
                    this.mesh.traverse( function( child ) {
                        if ( child instanceof THREE.Mesh ) child.material = mirrormat;
                    });
                    this.mesh.visible = true;

                    if (!this.data.repeat) {
                        this.done = true;
                        this.counter = this.data.interval;
                    }
                }
            }
        }
    },
});

AFRAME.registerComponent('lazy-load', {
    init: function() {
        const sky = document.getElementById('sky')
        const skyX = document.getElementById('sky-x')

        // start loading the image
        const skyImage = document.getElementById('calezaja')
        skyImage.src = 'jose-g-ortega-castro-PYpkPbBCNFw-unsplash.jpg'
        skyImage.addEventListener('load', () => {
            // actual display is a bit after load event
            // so don't start fade too early
            setTimeout(() => { skyX.emit('fadeout') }, 150)
        })
     }
})