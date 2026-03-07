import * as THREE from 'three';
import { TRACK_POINTS, TRACK_WIDTH } from './types';

let _curve: THREE.CatmullRomCurve3 | null = null;

export function getTrackCurve(): THREE.CatmullRomCurve3 {
  if (!_curve) {
    const pts = TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    _curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  }
  return _curve;
}

export function getTrackLength(): number {
  return getTrackCurve().getLength();
}

export function getPointOnTrack(t: number): THREE.Vector3 {
  return getTrackCurve().getPointAt(((t % 1) + 1) % 1);
}

export function getTangentOnTrack(t: number): THREE.Vector3 {
  return getTrackCurve().getTangentAt(((t % 1) + 1) % 1);
}

export function getClosestT(pos: THREE.Vector3, samples = 200): number {
  const curve = getTrackCurve();
  let bestT = 0;
  let bestDist = Infinity;
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const d = pos.distanceTo(p);
    if (d < bestDist) { bestDist = d; bestT = t; }
  }
  return bestT;
}

export function buildTrackGeometry(): THREE.BufferGeometry {
  const curve = getTrackCurve();
  const segments = 300;
  const halfW = TRACK_WIDTH / 2;

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const left = point.clone().add(right.clone().multiplyScalar(-halfW));
    const rt = point.clone().add(right.clone().multiplyScalar(halfW));

    vertices.push(left.x, left.y + 0.01, left.z);
    vertices.push(rt.x, rt.y + 0.01, rt.z);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, t * 20, 1, t * 20);

    if (i < segments) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

export function buildBarrierGeometry(side: 'left' | 'right'): THREE.BufferGeometry {
  const curve = getTrackCurve();
  const segments = 300;
  const halfW = TRACK_WIDTH / 2;
  const barrierH = 1.2;

  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const offset = side === 'left' ? -halfW - 0.3 : halfW + 0.3;
    const base = point.clone().add(right.clone().multiplyScalar(offset));

    vertices.push(base.x, base.y, base.z);
    vertices.push(base.x, base.y + barrierH, base.z);
    const n = side === 'left' ? right : right.clone().negate();
    normals.push(n.x, n.y, n.z, n.x, n.y, n.z);

    if (i < segments) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (side === 'left') {
        indices.push(a, b, c, b, d, c);
      } else {
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
