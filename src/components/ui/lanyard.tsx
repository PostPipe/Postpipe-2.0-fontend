/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

const cardGLB = '/lanyard/card.glb';
const defaultLanyard = '/lanyard/lanyard.png';

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  items = [],
  className = '',
  isInView = true,
}: any) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative z-0 w-full h-full flex justify-center items-center ${className}`}>
      <Canvas
        frameloop={isInView ? 'always' : 'never'}
        camera={{ position: position, fov: fov }}
        dpr={[1, 1.2]}
        gl={{ alpha: transparent, antialias: false, powerPreference: "default" }}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60} paused={!isInView}>
          {items.map((item: any, i: number) => (
            <Band
              key={i}
              isMobile={isMobile}
              {...item}
            />
          ))}
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  photoImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  ropeLength = 1,
  logoRepeats = 3,
  anchorX = 0,
  anchorY = 8,
  anchorZ = 0,
  username
}: any) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const { size } = useThree();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture(lanyardImage || defaultLanyard) as THREE.Texture;

  const frontTex = useTexture(frontImage || BLANK_PIXEL) as THREE.Texture;
  const backTex = useTexture(backImage || BLANK_PIXEL) as THREE.Texture;
  const photoTex = useTexture(photoImage || BLANK_PIXEL) as THREE.Texture;

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: any, rect: any) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    // Dynamically draw the user's photo over the SVG background
    if (photoImage && photoTex.image) {
      const rx = FRONT_UV_RECT.x * W;
      const ry = FRONT_UV_RECT.y * H;
      const rw = FRONT_UV_RECT.w * W;
      const rh = FRONT_UV_RECT.h * H;

      const imgW = 400;
      const imgH = 600;
      const scale = Math.max(rw / imgW, rh / imgH);
      const dw = imgW * scale;
      const dh = imgH * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;

      // Avatar logical bounds in SVG: x=100, y=80, w=200, h=200
      const avatarX = dx + 100 * scale;
      const avatarY = dy + 80 * scale;
      const avatarW = 200 * scale;
      const avatarH = 200 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarW / 2, avatarY + avatarH / 2, avatarW / 2, 0, Math.PI * 2);
      ctx.clip();

      // preserve aspect ratio (cover)
      const pImage = photoTex.image as HTMLImageElement;
      const pScale = Math.max(avatarW / pImage.width, avatarH / pImage.height);
      const pdw = pImage.width * pScale;
      const pdh = pImage.height * pScale;
      const pdx = avatarX + (avatarW - pdw) / 2;
      const pdy = avatarY + (avatarH - pdh) / 2;

      ctx.drawImage(pImage, pdx, pdy, pdw, pdh);

      // The 3D scene uses extremely bright studio lighting (intensity 10+) to make the dark plastic look good.
      // This lighting completely blows out standard photos. 
      // We apply a 45% black ND-filter overlay exclusively to the photo area to normalize its exposure.
      ctx.fillStyle = "rgba(93, 93, 93, 0.2)";
      ctx.fill();

      ctx.restore();
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, photoImage, imageFit, frontTex, backTex, photoTex, materials.base.map]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );

  const [dragged, drag] = useState<any>(false);
  const [hovered, hover] = useState(false);
  const [retracting, setRetracting] = useState(false);
  const maxDist = ropeLength * 3 + 1.5;

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    // Cap delta to prevent physics explosions when the tab goes to the background
    const dt = Math.min(delta, 0.1);

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    } else if (retracting && card.current) {
      const currentPos = new THREE.Vector3().copy(card.current.translation());
      const anchorPos = new THREE.Vector3(anchorX, anchorY, anchorZ);
      const dist = anchorPos.distanceTo(currentPos);
      
      if (dist <= maxDist + 0.1) {
        setRetracting(false);
        // Reset velocities to prevent residual physics explosion
        card.current.setLinvel({ x: 0, y: 0, z: 0 });
        card.current.setAngvel({ x: 0, y: 0, z: 0 });
        [j1, j2, j3].forEach(ref => {
          if (ref.current) {
            ref.current.setLinvel({ x: 0, y: 0, z: 0 });
            ref.current.setAngvel({ x: 0, y: 0, z: 0 });
          }
        });
      } else {
        // Smoothly lerp towards the valid boundary
        const targetPos = currentPos.clone().sub(anchorPos).normalize().multiplyScalar(maxDist).add(anchorPos);
        currentPos.lerp(targetPos, Math.min(1, dt * 12)); // smooth retraction speed
        card.current.setNextKinematicTranslation(currentPos);
        [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      }
    }
    
    if (fixed.current) {
      // Gentle wind effect (varies per item based on X position)
      if (j2.current && !dragged) {
        const time = state.clock.elapsedTime;
        const swayX = Math.sin(time * 1.5 + fixed.current.translation().x) * 0.15 * dt;
        const swayZ = Math.cos(time * 1.1 + fixed.current.translation().x) * 0.15 * dt;
        j2.current.applyImpulse({ x: swayX, y: 0, z: swayZ }, true);
      }

      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          Math.min(1, dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[anchorX, anchorY, anchorZ]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0, -ropeLength, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -ropeLength * 2, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -ropeLength * 3, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -ropeLength * 3 - 1.5, 0]} ref={card} {...segmentProps} type={dragged || retracting ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
              window.dispatchEvent(new CustomEvent('scan-zone-hover', { detail: false }));
              
              if (card.current) {
                const currentPos = card.current.translation();
                const anchorPos = new THREE.Vector3(anchorX, anchorY, anchorZ);
                if (anchorPos.distanceTo(currentPos) > maxDist) {
                  setRetracting(true);
                }
              }
              
              if (username && e.clientX && e.clientY) {
                const screenX = e.clientX;
                const screenY = e.clientY;
                const w = window.innerWidth;
                const h = window.innerHeight;
                
                // Generous drop zone: center 400px wide, bottom 250px
                if (screenY > h - 250 && screenX > (w / 2 - 200) && screenX < (w / 2 + 200)) {
                  window.open(`https://github.com/${username}`, '_blank');
                }
              }
            }}
            onPointerDown={(e: any) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
            onPointerMove={(e: any) => {
              if (dragged) {
                const screenX = e.clientX;
                const screenY = e.clientY;
                const w = window.innerWidth;
                const h = window.innerHeight;
                const inDropZone = (screenY > h - 250 && screenX > (w / 2 - 200) && screenX < (w / 2 + 200));
                window.dispatchEvent(new CustomEvent('scan-zone-hover', { detail: inDropZone }));
              }
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[size.width, size.height]}
          transparent={true}
          useMap
          map={texture}
          repeat={[-logoRepeats, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
