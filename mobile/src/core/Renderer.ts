// @ts-nocheck
import { Entity } from './Entity'
import { Vector2 } from './Vector2'
import { ExpoWebGLRenderingContext } from 'expo-gl'
import { ParticleSystem } from './ParticleSystem'

export interface CameraView {
    scale: number
    rotation: number
    offset: Vector2
}

export class Renderer {
    gl: ExpoWebGLRenderingContext
    width: number
    height: number
    camera: CameraView = { scale: 1, rotation: 0, offset: new Vector2(0, 0) }

    // Programs
    entityProgram: WebGLProgram | null = null
    bgProgram: WebGLProgram | null = null
    particleProgram: WebGLProgram | null = null

    // Buffers
    quadBuffer: WebGLBuffer | null = null
    particleBuffer: WebGLBuffer | null = null

    // Arrays
    particleData: Float32Array

    // [NEW] Track Level state for Theme
    currentLevel: number = 1

    constructor(gl: ExpoWebGLRenderingContext, width: number, height: number) {
        this.gl = gl
        this.width = width
        this.height = height
        // 500 particles * 6 vertices (2 tris) * 5 floats (x, y, r, g, b, [size/alpha?]) 
        // Let's do x, y, size, r, g, b, a (7 floats) 
        this.particleData = new Float32Array(500 * 6 * 7)
        this.initGL()
    }

    initGL() {
        const gl = this.gl
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE) // Additive blending for "Glow" look

        this.quadBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

        this.particleBuffer = gl.createBuffer()

        this.initEntityShader()
        this.initBackgroundShader()
        this.initParticleShader()

        const err = gl.getError()
        if (err !== gl.NO_ERROR) console.error("GL Error Init:", err)
    }

    createShader(vertSrc: string, fragSrc: string) {
        const gl = this.gl
        const vert = gl.createShader(gl.VERTEX_SHADER)!
        gl.shaderSource(vert, vertSrc)
        gl.compileShader(vert)
        if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
            console.error("Vert Error:", gl.getShaderInfoLog(vert))
        }

        const frag = gl.createShader(gl.FRAGMENT_SHADER)!
        gl.shaderSource(frag, fragSrc)
        gl.compileShader(frag)
        if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
            console.error("Frag Error:", gl.getShaderInfoLog(frag))
        }

        const prog = gl.createProgram()!
        gl.attachShader(prog, vert)
        gl.attachShader(prog, frag)
        gl.linkProgram(prog)
        return prog
    }

    initEntityShader() {
        const vert = `
        precision highp float;
        attribute vec2 position; 
        uniform vec2 resolution;
        uniform vec2 entityPos; 
        uniform float entityRadius; 
        varying vec2 vUV;
        void main() {
            // position is -1 to 1 vertex
            vUV = position; 
            vec2 localPos = position * entityRadius; 
            vec2 worldPos = entityPos + localPos;
            vec2 zeroOne = worldPos / resolution;
            vec2 clip = (zeroOne * 2.0) - 1.0;
            gl_Position = vec4(clip.x, -clip.y, 0, 1);
        }`
        const frag = `
        precision highp float;
        uniform vec4 color;
        uniform int u_shape; // 0=circle, 1=square, 2=hex, 3=triangle, 4=asteroid
        uniform float u_angle;
        uniform float u_seed;
        uniform float u_time; 
        varying vec2 vUV;
        
        // SDF Constants
        #define PI 3.14159265359

        mat2 rotate2d(float _angle){
            return mat2(cos(_angle),-sin(_angle),
                        sin(_angle),cos(_angle));
        }

        // SDF Primitives (p is -1 to 1)
        float sdCircle(vec2 p, float r) {
            return length(p) - r;
        }

        float sdBox(vec2 p, vec2 b) {
            vec2 d = abs(p) - b;
            return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
        }

        // Simple Leaf (Vesica Piscis)
        float sdLeaf(vec2 p, float r) {
             // Offset circles to create lens intersection
             // r is size ~0.7
             float circleR = r * 1.5;
             float offset = r * 0.8;
             
             // Two circles at +/- offset on X axis
             // Using length() for correct SDF
             float d1 = length(p - vec2(offset, 0.0)) - circleR;
             float d2 = length(p + vec2(offset, 0.0)) - circleR;
             
             // Intersection
             return max(d1, d2);
        }

        float sdEquilateralTriangle(vec2 p) {
            const float k = sqrt(3.0);
            p.x = abs(p.x) - 1.0;
            p.y = p.y + 1.0/k;
            if( p.x+k*p.y > 0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
            p.x -= clamp( p.x, -2.0, 0.0 );
            return -length(p)*sign(p.y);
        }

        // ...
        
        float sdAsteroid(vec2 p, float r, float seed) {
            float a = atan(p.y, p.x);
            float distortion = sin(a * 5.0 + seed) * 0.1 + sin(a * 12.0 + seed*2.0) * 0.05;
            return length(p) - (r + distortion);
        }

        float sdRing(vec2 p, float r, float w) {
            return abs(length(p) - r) - w;
        }

        void main() {
            vec2 p = vUV;
            
            // [FIX] Apply Rotation
            if (u_angle != 0.0) {
                p = rotate2d(-u_angle) * p;
            }

            float dist = 0.0;
            
            if (u_shape == 0) dist = sdCircle(p, 1.0);
            else if (u_shape == 1) dist = sdBox(p, vec2(0.8));
            else if (u_shape == 2) dist = sdLeaf(p, 0.6);
            else if (u_shape == 3) {
                 vec2 tUV = p; tUV.y += 0.3;
                 dist = sdEquilateralTriangle(tUV * 1.5);
            }
            else if (u_shape == 4) dist = sdAsteroid(p, 1.0, u_seed);
            else if (u_shape == 5) dist = sdRing(p, 0.85, 0.015); // [NEW] Ring Primitive (Thinner, r=0.85)

            vec4 finalColor = color;
            
            // [NEW] Joystick Ring Specific Render
            if (u_shape == 5) {
                 float alpha = 1.0 - smoothstep(0.0, 0.01, dist);
                 gl_FragColor = vec4(finalColor.rgb, finalColor.a * alpha);
                 if (gl_FragColor.a < 0.01) discard;
                 return;
            }

            // --- RENDER LOGIC ---
            // Player (Cyan Dot)
            if (color.b > 0.8 && color.r < 0.2) {
                 float alpha = 1.0 - smoothstep(0.0, 0.05, dist);
                 gl_FragColor = vec4(finalColor.rgb, finalColor.a * alpha);
                 return;
            }

            // AESTHETIC OBSTACLES (Red/Pink/Orange)
            bool isRound = (u_shape == 0 || u_shape == 4);
            
             if (isRound && color.r > 0.5) {
                 float opacity = 1.0 - smoothstep(0.0, 0.02, dist); 
                 float innerGlow = exp(dist * 2.0); 
                 vec3 finalCol = finalColor.rgb + vec3(1.0) * innerGlow * 0.5; 
                 finalCol *= 0.7;
                 gl_FragColor = vec4(finalCol, finalColor.a * opacity * 0.8);

            } else if (u_shape == 2) {
                 // LEAF
                 float opacity = 1.0 - smoothstep(0.0, 0.02, dist);
                 vec3 inner = finalColor.rgb; 
                 vec3 outer = finalColor.rgb * 0.3; 
                 float t = smoothstep(-0.4, 0.1, dist); 
                 vec3 finalCol = mix(inner, outer, t);
                 if (abs(p.y) < 0.02) finalCol += 0.2; 
                 gl_FragColor = vec4(finalCol, finalColor.a * opacity * 0.9);

            } else if (u_shape == 4) {
                 // ASTEROID
                 float opacity = 1.0 - smoothstep(0.0, 0.02, dist);
                 vec3 base = vec3(0.16, 0.04, 0.29); 
                 float rim = smoothstep(0.7, 0.9, dist + 0.1); 
                 vec3 finalCol = base + vec3(0.5, 0.2, 0.8) * rim;
                 gl_FragColor = vec4(finalCol, 0.8 * opacity);

            } else {
                 // Standard (Box/Triangle/Coin)
                 float alpha = 1.0 - smoothstep(0.0, 0.05, dist); // Default AA
                 gl_FragColor = vec4(finalColor.rgb * 0.7, finalColor.a * alpha * 0.8);
            }
            
            if (gl_FragColor.a < 0.01) discard;
        }`
        this.entityProgram = this.createShader(vert, frag)
    }



    initBackgroundShader() {
        const vert = `
        precision highp float;
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0, 1);
        }`
        const frag = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_themeColor; // [UPDATE] Uniform for Theme
        uniform float u_showGround; // [NEW] Toggle Ground Effect

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            vec2 center = vec2(0.5, 0.5);
            
            vec2 pos = st;
            pos.x *= aspect;
            vec2 centerFixed = center;
            centerFixed.x *= aspect;
            
            float dist = distance(pos, centerFixed);
            
            // --- DYNAMIC GRADIENT ---
            vec3 c1 = u_themeColor;
            
            // [UPDATE] Slightly lighter edge (Deep Blue-Black instead of Void Black) to reduce "too dark" feel
            vec3 edgeCol = vec3(0.05, 0.05, 0.08); 
            
            // [UPDATE] Extended gradient range (1.3 -> 1.8) to "show the gradient color more"
            vec3 bg = mix(c1, edgeCol, smoothstep(0.0, 1.8, dist));

            // [UPDATE] Vertical Vignette: Darken the top area (Deep Sky Effect)
            // Starts fading from center (0.5) to top (1.0), reducing brightness by 40% at the very top.
            float verticalDarkness = smoothstep(0.4, 1.0, st.y);
            bg *= (1.0 - verticalDarkness * 0.4);
            
            // --- REDUCED STARS ---
            float r = random(st);
            // Threshold increased from 0.998 to 0.9995 (4x fewer stars)
            if (r > 0.9995) {
                float shine = sin(u_time * 2.0 + r * 100.0) * 0.5 + 0.5;
                bg += vec3(shine * 0.6); // Slightly dimmer too
            }

            // --- PREMIUM ELECTRIC GROUND ---
            float groundY = st.y; 
            
            // Check if we are near "Visual Bottom" AND Effect is Enabled
            if (groundY < 0.10 && u_showGround > 0.5) { // [FIX] Reduced height (0.12 -> 0.10)
                // Electric Plasma Logic
                float t = u_time * 8.0;
                float x = st.x;
                
                // 3 Layers of Bolt Distortion
                float bolt = sin(x * 20.0 + t) + sin(x * 50.0 - t * 2.0) * 0.5 + sin(x * 150.0 + t * 5.0) * 0.2;
                
                // Vertical fade: Strongest at 0.0, fading to 0.10
                float intensity = 1.0 - (groundY / 0.10);
                intensity = pow(intensity, 3.0); // Sharp falloff
                
                // Threshold for "Sparks"
                float spark = step(1.5, abs(bolt) * intensity * 2.5);
                
                // Color Composition (Dynamic Tint)
                vec3 glowColor = c1 * 4.0; // [UPDATE] Match Theme
                if (length(glowColor) < 0.2) glowColor = vec3(0.2, 0.4, 1.0); // Only fallback if PITCH black
                // Boost Saturation/Brightness if too dull
                glowColor = max(glowColor, c1 * 8.0); 
 
                
                vec3 coreColor = vec3(0.9, 0.95, 1.0); // White-Hot with slight cool tint
                
                bg = mix(bg, glowColor, intensity * 0.8);
                bg += coreColor * spark * intensity;
                
                // Occasional "Main Bolt" lateral strike
                if (random(vec2(floor(u_time * 10.0), 0.0)) > 0.8) {
                    bg += vec3(1.0) * intensity * 0.5;
                }
            }

            gl_FragColor = vec4(bg, 1.0);
        }`

        this.bgProgram = this.createShader(vert, frag)
    }

    initParticleShader() {
        // Vertex Colored
        const vert = `
        precision highp float;
        attribute vec2 position;
        attribute vec4 color;
        attribute float size;
        uniform vec2 resolution;
        varying vec4 vColor;
void main() {
            vec2 zeroOne = position / resolution;
            vec2 clip = (zeroOne * 2.0) - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0, 1);
    gl_PointSize = size;
    vColor = color;
} `
        const frag = `
        precision highp float;
        varying vec4 vColor;
void main() {
    gl_FragColor = vColor;
} `
        this.particleProgram = this.createShader(vert, frag)
    }

    setCamera(camera: CameraView) { this.camera = camera }
    applyCamera() { }

    clear() {
        this.gl.clearColor(0, 0, 0, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }

    // [NEW] Centralized Theme Logic
    getLevelTheme(level: number) {
        // [PREMIUM UX OVERHAUL]
        // "Extreme Good Knowledge of Colors" - Curated "Moods".
        // Returns normalized RGB [0-1]

        // Helper: Hex to RGB (Approximated for performance or just pre-calculated)
        // [SWAP] User requested L4/L10 swap "including color"
        if (level === 4) return { bg: [0.01, 0.02, 0.07], obs: [1.0, 0.84, 0.0] } // Theme 2 (Gold)
        if (level === 10) return { bg: [0.06, 0.04, 0.04], obs: [0.93, 0.69, 0.46] } // Theme 1 (Copper)

        // 1. OBSIDIAN GLASS (L1-5): Warm Charcoal + Rose Copper
        // BG: #100a0a [0.06, 0.04, 0.04], Obs: #eeb075 [0.93, 0.69, 0.46]
        if (level <= 5) return { bg: [0.06, 0.04, 0.04], obs: [0.93, 0.69, 0.46] }

        // 2. ROYAL LUXURY (L6-10): Midnight Navy + Rich Gold
        // BG: #020412 [0.01, 0.02, 0.07], Obs: #ffd700 [1.0, 0.84, 0.0]
        if (level <= 10) return { bg: [0.01, 0.02, 0.07], obs: [1.0, 0.84, 0.0] }

        // 3. MIDNIGHT BLOSSOM (L11-14): Deep Indigo + Sakura Pink
        // Recalibrated range due to User Request (L15 -> Red)
        if (level <= 14) return { bg: [0.02, 0.02, 0.1], obs: [1.0, 0.6, 0.8] }

        // 4. CRIMSON JUNGLE (L15-20): Darkest Jungle + Pure Red
        // User Request: "change from 15 - 20 with pure red"
        // BG: #000d05 [0.0, 0.05, 0.02], Obs: #FF0000 [1.0, 0.0, 0.0]
        if (level <= 20) return { bg: [0.0, 0.05, 0.02], obs: [1.0, 0.0, 0.0] }

        // 5. CRIMSON PEAK (L21-25): Blood Red + Stark White
        // BG: #1a0000 [0.1, 0.0, 0.0], Obs: #ffffff [1.0, 1.0, 1.0]
        // "Extreme" contrast. Daring.
        if (level <= 25) return { bg: [0.1, 0.0, 0.0], obs: [1.0, 1.0, 1.0] }

        // 6. ARCTIC AURORA (L26-30): Ice Blue + Frost White
        // BG: #001020 [0.0, 0.06, 0.12], Obs: #ccffee [0.8, 1.0, 1.0]
        if (level <= 30) return { bg: [0.0, 0.06, 0.12], obs: [0.8, 1.0, 1.0] }

        // 7. NULL VOID (L31-35): Absolute Black + Electric Lime
        // BG: #000000 [0.0, 0.0, 0.0], Obs: #ccff00 [0.8, 1.0, 0.0]
        // As requested: Extreme.
        if (level <= 35) return { bg: [0.0, 0.0, 0.0], obs: [0.8, 1.0, 0.0] }

        // 8. EMERALD DEPTHS (L36-40): Dark Green + Pale Gold
        // BG: #021a0a [0.01, 0.1, 0.04], Obs: #fffdd0 [1.0, 0.99, 0.82]
        if (level <= 40) return { bg: [0.01, 0.1, 0.04], obs: [1.0, 0.99, 0.82] }

        // 9. ABYSS (L41-45): Deepest Slate + Rose Quartz
        // BG: #080a10 [0.03, 0.04, 0.06], Obs: #f7a8b8 [0.97, 0.66, 0.72]
        if (level <= 45) return { bg: [0.03, 0.04, 0.06], obs: [0.97, 0.66, 0.72] }

        // 10. ENDGAME (L46+): Matrix
        return { bg: [0.0, 0.02, 0.0], obs: [0.0, 1.0, 0.2] }
    }

    drawBackground(time: number, level: number, showGround: boolean = true) {
        const gl = this.gl
        gl.useProgram(this.bgProgram)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)

        const posLoc = gl.getAttribLocation(this.bgProgram!, "position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const theme = this.getLevelTheme(level)
        const uTheme = gl.getUniformLocation(this.bgProgram!, "u_themeColor")
        if (uTheme) gl.uniform3f(uTheme, theme.bg[0], theme.bg[1], theme.bg[2])

        // [NEW] Ground Toggle
        const uShow = gl.getUniformLocation(this.bgProgram!, "u_showGround")
        if (uShow) gl.uniform1f(uShow, showGround ? 1.0 : 0.0)

        gl.uniform1f(gl.getUniformLocation(this.bgProgram!, "u_time"), time)
        // [FIX] Background Shader uses gl_FragCoord (Physical), so it needs Physical Resolution (drawingBuffer)
        // Otherwise on Retina/HighDPI screens, st.y > 1.0 and effects disappear.
        gl.uniform2f(gl.getUniformLocation(this.bgProgram!, "u_resolution"), gl.drawingBufferWidth, gl.drawingBufferHeight)

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    drawParticles(system: ParticleSystem) {
        const gl = this.gl
        gl.useProgram(this.particleProgram)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer)

        let count = 0
        const arr = this.particleData

        for (let i = 0; i < system.maxParticles; i++) {
            const p = system.particles[i]
            if (!p.active) continue

            let idx = count * 7
            arr[idx] = p.x + this.camera.offset.x
            arr[idx + 1] = p.y + this.camera.offset.y
            arr[idx + 2] = p.size
            arr[idx + 3] = p.color[0]
            arr[idx + 4] = p.color[1]
            arr[idx + 5] = p.color[2]
            arr[idx + 6] = p.color[3] * (p.life / p.maxLife)
            count++
        }

        if (count === 0) return

        gl.bufferData(gl.ARRAY_BUFFER, arr.subarray(0, count * 7 * 4), gl.DYNAMIC_DRAW)

        const posLoc = gl.getAttribLocation(this.particleProgram!, "position")
        const colLoc = gl.getAttribLocation(this.particleProgram!, "color")
        const sizeLoc = gl.getAttribLocation(this.particleProgram!, "size")

        const stride = 7 * 4
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(sizeLoc)
        gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 2 * 4)

        gl.enableVertexAttribArray(colLoc)
        gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, stride, 3 * 4)

        gl.uniform2f(gl.getUniformLocation(this.particleProgram!, "resolution"), this.width, this.height)

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE) // Additive
        gl.drawArrays(gl.POINTS, 0, count)
    }

    drawEntity(entity: Entity) {
        const gl = this.gl
        gl.useProgram(this.entityProgram)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)

        const posLoc = gl.getAttribLocation(this.entityProgram!, "position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const uPos = gl.getUniformLocation(this.entityProgram!, "entityPos")
        const uRad = gl.getUniformLocation(this.entityProgram!, "entityRadius")
        const uCol = gl.getUniformLocation(this.entityProgram!, "color")
        const uRes = gl.getUniformLocation(this.entityProgram!, "resolution")
        const uShape = gl.getUniformLocation(this.entityProgram!, "u_shape")
        const uAngle = gl.getUniformLocation(this.entityProgram!, "u_angle")
        const uSeed = gl.getUniformLocation(this.entityProgram!, "u_seed")
        const uTime = gl.getUniformLocation(this.entityProgram!, "u_time")

        let x = entity.pos.x + this.camera.offset.x
        let y = entity.pos.y + this.camera.offset.y

        gl.uniform2f(uPos, x, y)
        gl.uniform1f(uRad, entity.radius)
        gl.uniform2f(uRes, this.width, this.height)

        let shapeId = 0
        if (entity.shape === 'square') shapeId = 1
        if (entity.shape === 'hex') shapeId = 2
        if (entity.shape === 'triangle') shapeId = 3
        if (entity.shape === 'asteroid') shapeId = 4
        if (entity.shape === 'ring') shapeId = 5 // [NEW] Ring Outline
        gl.uniform1i(uShape, shapeId)

        gl.uniform1f(uAngle, entity.angle || 0)
        gl.uniform1f(uSeed, entity.pos.x + entity.pos.y)

        // [NEW] Dynamic Theme Color
        // [NEW] Dynamic Theme Color
        const theme = this.getLevelTheme(this.currentLevel || 1)
        let rCol = theme.obs[0], gCol = theme.obs[1], bCol = theme.obs[2]

        // [FIX] Respect Entity Specific Color Override (e.g. Cream Nuclei)
        if (entity.color && entity.color.startsWith('#')) {
            const hex = entity.color.substring(1)
            const bigint = parseInt(hex, 16)
            rCol = ((bigint >> 16) & 255) / 255
            gCol = ((bigint >> 8) & 255) / 255
            bCol = (bigint & 255) / 255
        }

        if (entity.type === 'dot') { rCol = 0; gCol = 1; bCol = 1; }
        if (entity.type === 'exit') { rCol = 1; gCol = 0.0; bCol = 1; }
        if (entity.type === 'orb') { rCol = 1.0; gCol = 0.84; bCol = 0.0; } // [NEW] Gold

        gl.uniform4f(uCol, rCol, gCol, bCol, entity.alpha ?? 1.0)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    // [NEW] Joystick Renderer (White Ring + Arrows)
    drawJoystick(input: { isDown: boolean, getDragVector: () => Vector2 }, mode: 'right' | 'left' | 'hidden') {
        if (mode === 'hidden') return

        const gl = this.gl
        gl.useProgram(this.entityProgram)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)

        const posLoc = gl.getAttribLocation(this.entityProgram!, "position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const uPos = gl.getUniformLocation(this.entityProgram!, "entityPos")
        const uRad = gl.getUniformLocation(this.entityProgram!, "entityRadius")
        const uCol = gl.getUniformLocation(this.entityProgram!, "color")
        const uRes = gl.getUniformLocation(this.entityProgram!, "resolution")
        const uShape = gl.getUniformLocation(this.entityProgram!, "u_shape")
        const uAngle = gl.getUniformLocation(this.entityProgram!, "u_angle")

        // Position
        const margin = 120
        const baseX = mode === 'left' ? margin : this.width - margin
        const baseY = this.height - margin + 20

        // 1. Draw Ring (Silver Outline)
        gl.uniform2f(uPos, baseX, baseY)
        gl.uniform1f(uRad, 35.0) // [UPDATE] 50% Size (70 -> 35)
        gl.uniform2f(uRes, this.width, this.height)
        gl.uniform1i(uShape, 5) // Ring
        // Silver, mid opacity
        gl.uniform4f(uCol, 0.8, 0.8, 0.8, 0.4) // [UPDATE] Silver
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        // 2. Draw 4 Arrows (Triangles)
        gl.uniform1i(uShape, 3) // Triangle
        gl.uniform1f(uRad, 6.0) // [UPDATE] 50% Size
        gl.uniform4f(uCol, 0.8, 0.8, 0.8, 0.6) // [UPDATE] Silver

        const arrowDist = 25.0 // [UPDATE] Reduced spacing
        // Top
        gl.uniform2f(uPos, baseX, baseY - arrowDist)
        gl.uniform1f(uAngle, 0.0)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        // Bottom
        gl.uniform2f(uPos, baseX, baseY + arrowDist)
        gl.uniform1f(uAngle, 3.14159)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        // Left
        gl.uniform2f(uPos, baseX - arrowDist, baseY)
        gl.uniform1f(uAngle, -1.5708) // -90 deg
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        // Right
        gl.uniform2f(uPos, baseX + arrowDist, baseY)
        gl.uniform1f(uAngle, 1.5708) // 90 deg
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        gl.uniform1f(uAngle, 0.0) // Reset Angle

        // 3. Draw Knob
        let knobX = baseX
        let knobY = baseY
        if (input.isDown) {
            const drag = input.getDragVector()
            const dist = drag.mag()
            const maxDist = 70.0
            const clamped = (dist > maxDist) ? drag.normalize().mul(maxDist) : drag
            knobX += clamped.x
            knobY += clamped.y
        }

        gl.uniform2f(uPos, knobX, knobY)
        gl.uniform1f(uRad, 25.0)
        gl.uniform1i(uShape, 0) // Circle

        // Solid White Knob (or slightly transparent)
        const knobAlpha = input.isDown ? 0.9 : 0.5
        gl.uniform4f(uCol, 1.0, 1.0, 1.0, knobAlpha)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
