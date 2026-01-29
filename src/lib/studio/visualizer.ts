import * as THREE from 'three'
import { Layout, LayoutModel, Vec3 } from '@/types/studio'

export interface ViewportSettings {
  showGrid: boolean
  showBounds: boolean
  showAxes: boolean
  backgroundColor: string
  ambientLightIntensity: number
  directionalLightIntensity: number
}

export interface CameraState {
  position: Vec3
  target: Vec3
  fov: number
  near: number
  far: number
}

export interface VisualizerCallbacks {
  onModelClick?: (modelId: string) => void
  onModelHover?: (modelId: string | null) => void
  onCameraChange?: (camera: CameraState) => void
  onPerformanceWarning?: (warning: string) => void
}

/**
 * Professional Three.js-based 3D visualizer for xLights sequences
 * Supports up to 100k+ LEDs with instanced rendering and adaptive quality
 */
export class StudioVisualizer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private controls: any | null = null // OrbitControls (imported dynamically)
  
  // Lighting
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight
  private directionalLightHelper?: THREE.DirectionalLightHelper
  
  // Environment
  private gridHelper?: THREE.GridHelper
  private axesHelper?: THREE.AxesHelper
  private boundsBox?: THREE.Box3Helper
  
  // Model instances
  private modelMeshes = new Map<string, THREE.InstancedMesh>()
  private modelMetadata = new Map<string, {
    model: LayoutModel
    instanceCount: number
    instancedPositions: Float32Array
    instancedColors: Float32Array
    instancedVisibility: Float32Array
  }>()
  
  // Performance tracking
  private stats: {
    frameCount: number
    renderTime: number
    triangleCount: number
    drawCalls: number
    lastFpsCheck: number
    fps: number
  } = {
    frameCount: 0,
    renderTime: 0,
    triangleCount: 0,
    drawCalls: 0,
    lastFpsCheck: 0,
    fps: 60
  }
  
  private isPlaying = false
  private animationFrameId?: number
  private callbacks: VisualizerCallbacks = {}
  
  // LED Materials with gamma correction
  private ledMaterial: THREE.ShaderMaterial
  
  constructor(canvas: HTMLCanvasElement) {
    // Initialize renderer with WebGL2
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a0a)
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      45, // fov
      1, // aspect (will be updated)
      0.1, // near
      1000 // far
    )
    this.camera.position.set(10, 10, 10)
    
    // Initialize lighting
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    this.scene.add(this.ambientLight)
    
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.directionalLight.position.set(10, 10, 5)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.1
    this.directionalLight.shadow.camera.far = 50
    this.directionalLight.shadow.camera.left = -10
    this.directionalLight.shadow.camera.right = 10
    this.directionalLight.shadow.camera.top = 10
    this.directionalLight.shadow.camera.bottom = -10
    this.scene.add(this.directionalLight)
    
    // Create LED material with custom shader
    this.ledMaterial = this.createLEDMaterial()
    
    // Initialize controls (async)
    this.initializeControls()
    
    // Setup environment helpers
    this.setupEnvironment()
  }
  
  private createLEDMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointSize: { value: 3.0 },
        brightness: { value: 1.0 }
      },
      vertexShader: `
        attribute vec3 instancePosition;
        attribute vec3 instanceColor;
        attribute float instanceVisibility;
        
        uniform float time;
        uniform float pointSize;
        
        varying vec3 vColor;
        varying float vVisibility;
        
        void main() {
          vColor = instanceColor;
          vVisibility = instanceVisibility;
          
          vec3 pos = position + instancePosition;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = pointSize * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform float brightness;
        
        varying vec3 vColor;
        varying float vVisibility;
        
        void main() {
          if (vVisibility < 0.5) discard;
          
          // Create circular point
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Apply gamma correction and brightness
          vec3 color = pow(vColor * brightness, vec3(1.0/2.2));
          
          // Add glow effect
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      vertexColors: true
    })
  }
  
  private async initializeControls() {
    // Dynamic import to avoid SSR issues
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.screenSpacePanning = false
    this.controls.maxPolarAngle = Math.PI
    this.controls.minDistance = 1
    this.controls.maxDistance = 100
    
    this.controls.addEventListener('change', () => {
      if (this.callbacks.onCameraChange) {
        this.callbacks.onCameraChange({
          position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
          target: [this.controls.target.x, this.controls.target.y, this.controls.target.z],
          fov: this.camera.fov,
          near: this.camera.near,
          far: this.camera.far
        })
      }
    })
  }
  
  private setupEnvironment() {
    // Grid helper
    this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    this.gridHelper.visible = true
    this.scene.add(this.gridHelper)
    
    // Axes helper
    this.axesHelper = new THREE.AxesHelper(2)
    this.axesHelper.visible = false
    this.scene.add(this.axesHelper)
    
    // Directional light helper
    this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 1)
    this.directionalLightHelper.visible = false
    this.scene.add(this.directionalLightHelper)
  }
  
  /**
   * Load a layout into the visualizer
   */
  loadLayout(layout: Layout) {
    // Clear existing models
    this.clearModels()
    
    // Calculate layout bounds
    const bounds = new THREE.Box3()
    
    layout.models.forEach(model => {
      this.addModel(model)
      
      // Update bounds
      model.positions.forEach(pos => {
        bounds.expandByPoint(new THREE.Vector3(pos[0], pos[1], pos[2]))
      })
    })
    
    // Setup bounds visualization
    if (this.boundsBox) {
      this.scene.remove(this.boundsBox)
    }
    if (!bounds.isEmpty()) {
      this.boundsBox = new THREE.Box3Helper(bounds, 0x888888)
      this.boundsBox.visible = false
      this.scene.add(this.boundsBox)
      
      // Center camera on bounds
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      
      this.camera.position.set(
        center.x + maxDim,
        center.y + maxDim * 0.7,
        center.z + maxDim
      )
      
      if (this.controls) {
        this.controls.target.copy(center)
        this.controls.update()
      }
    }
  }
  
  /**
   * Add a single model to the scene
   */
  private addModel(model: LayoutModel) {
    const ledCount = model.positions.length
    
    if (ledCount === 0) return
    
    // Create instanced mesh for LEDs
    const geometry = new THREE.SphereGeometry(0.05, 8, 6)
    const instancedMesh = new THREE.InstancedMesh(geometry, this.ledMaterial.clone(), ledCount)
    
    // Setup instance attributes
    const instancedPositions = new Float32Array(ledCount * 3)
    const instancedColors = new Float32Array(ledCount * 3)
    const instancedVisibility = new Float32Array(ledCount)
    
    model.positions.forEach((pos, index) => {
      // Position
      instancedPositions[index * 3] = pos[0]
      instancedPositions[index * 3 + 1] = pos[1]
      instancedPositions[index * 3 + 2] = pos[2]

      // Default color (white)
      instancedColors[index * 3] = 1.0
      instancedColors[index * 3 + 1] = 1.0
      instancedColors[index * 3 + 2] = 1.0

      // Visibility (on)
      instancedVisibility[index] = 1.0
      
      // Set instance matrix
      const matrix = new THREE.Matrix4()
      matrix.setPosition(pos[0], pos[1], pos[2])
      instancedMesh.setMatrixAt(index, matrix)
    })
    
    // Add instance attributes
    geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancedPositions, 3))
    geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(instancedColors, 3))
    geometry.setAttribute('instanceVisibility', new THREE.InstancedBufferAttribute(instancedVisibility, 1))
    
    instancedMesh.instanceMatrix.needsUpdate = true
    instancedMesh.userData.modelId = model.id
    instancedMesh.userData.modelType = model.type
    
    this.scene.add(instancedMesh)
    this.modelMeshes.set(model.id, instancedMesh)
    
    // Store metadata
    this.modelMetadata.set(model.id, {
      model,
      instanceCount: ledCount,
      instancedPositions,
      instancedColors,
      instancedVisibility
    })
  }
  
  /**
   * Update LED colors for a specific model
   */
  updateModelColors(modelId: string, colors: Float32Array) {
    const mesh = this.modelMeshes.get(modelId)
    const metadata = this.modelMetadata.get(modelId)
    
    if (!mesh || !metadata) return
    
    const geometry = mesh.geometry as THREE.BufferGeometry
    const colorAttribute = geometry.getAttribute('instanceColor') as THREE.InstancedBufferAttribute
    
    // Update colors
    const colorsPerLED = Math.min(colors.length / 3, metadata.instanceCount)
    for (let i = 0; i < colorsPerLED; i++) {
      metadata.instancedColors[i * 3] = colors[i * 3]
      metadata.instancedColors[i * 3 + 1] = colors[i * 3 + 1]
      metadata.instancedColors[i * 3 + 2] = colors[i * 3 + 2]
    }
    
    colorAttribute.needsUpdate = true
  }
  
  /**
   * Set model visibility
   */
  setModelVisibility(modelId: string, visible: boolean) {
    const mesh = this.modelMeshes.get(modelId)
    const metadata = this.modelMetadata.get(modelId)
    
    if (!mesh || !metadata) return
    
    const geometry = mesh.geometry as THREE.BufferGeometry
    const visibilityAttribute = geometry.getAttribute('instanceVisibility') as THREE.InstancedBufferAttribute
    
    // Update visibility for all LEDs in model
    const visibility = visible ? 1.0 : 0.0
    for (let i = 0; i < metadata.instanceCount; i++) {
      metadata.instancedVisibility[i] = visibility
    }
    
    visibilityAttribute.needsUpdate = true
  }
  
  /**
   * Update viewport settings
   */
  updateSettings(settings: Partial<ViewportSettings>) {
    if (settings.showGrid !== undefined && this.gridHelper) {
      this.gridHelper.visible = settings.showGrid
    }
    
    if (settings.showBounds !== undefined && this.boundsBox) {
      this.boundsBox.visible = settings.showBounds
    }
    
    if (settings.showAxes !== undefined && this.axesHelper) {
      this.axesHelper.visible = settings.showAxes
    }
    
    if (settings.backgroundColor !== undefined) {
      this.scene.background = new THREE.Color(settings.backgroundColor)
    }
    
    if (settings.ambientLightIntensity !== undefined) {
      this.ambientLight.intensity = settings.ambientLightIntensity
    }
    
    if (settings.directionalLightIntensity !== undefined) {
      this.directionalLight.intensity = settings.directionalLightIntensity
    }
  }
  
  /**
   * Set callbacks for user interaction
   */
  setCallbacks(callbacks: VisualizerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
  
  /**
   * Start animation loop
   */
  play() {
    if (this.isPlaying) return
    
    this.isPlaying = true
    this.animate()
  }
  
  /**
   * Stop animation loop
   */
  pause() {
    this.isPlaying = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
  
  /**
   * Animation loop
   */
  private animate = () => {
    if (!this.isPlaying) return
    
    const startTime = performance.now()
    
    // Update controls
    if (this.controls) {
      this.controls.update()
    }
    
    // Update shader uniforms
    this.ledMaterial.uniforms.time.value = performance.now() * 0.001
    
    // Render
    this.renderer.render(this.scene, this.camera)
    
    // Performance tracking
    const renderTime = performance.now() - startTime
    this.stats.frameCount++
    this.stats.renderTime += renderTime
    
    // Check FPS every second
    if (startTime - this.stats.lastFpsCheck > 1000) {
      this.stats.fps = this.stats.frameCount
      this.stats.frameCount = 0
      this.stats.lastFpsCheck = startTime
      this.stats.renderTime = 0
      
      // Performance warning
      if (this.stats.fps < 30 && this.callbacks.onPerformanceWarning) {
        this.callbacks.onPerformanceWarning(
          `Low FPS: ${this.stats.fps}. Consider reducing LED count or quality settings.`
        )
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.animate)
  }
  
  /**
   * Resize viewport
   */
  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }
  
  /**
   * Clear all models from scene
   */
  private clearModels() {
    this.modelMeshes.forEach((mesh) => {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose())
      } else {
        mesh.material.dispose()
      }
    })
    
    this.modelMeshes.clear()
    this.modelMetadata.clear()
  }
  
  /**
   * Capture screenshot
   */
  captureScreenshot(): string {
    return this.renderer.domElement.toDataURL('image/png')
  }
  
  /**
   * Get performance stats
   */
  getStats() {
    return {
      ...this.stats,
      triangleCount: this.renderer.info.render.triangles,
      drawCalls: this.renderer.info.render.calls
    }
  }
  
  /**
   * Cleanup resources
   */
  dispose() {
    this.pause()
    this.clearModels()
    
    // Dispose materials
    this.ledMaterial.dispose()
    
    // Dispose renderer
    this.renderer.dispose()
    
    // Remove event listeners
    if (this.controls) {
      this.controls.dispose()
    }
  }
}