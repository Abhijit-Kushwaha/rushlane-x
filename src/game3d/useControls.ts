import { useEffect, useRef } from 'react';

export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  nitro: boolean;
  drift: boolean;
  cameraToggle: boolean;
}

export function useControls() {
  const controls = useRef<Controls>({
    forward: false, backward: false,
    left: false, right: false,
    nitro: false, drift: false,
    cameraToggle: false,
  });
  const cameraToggled = useRef(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const c = controls.current;
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': c.forward = true; break;
        case 's': case 'arrowdown': c.backward = true; break;
        case 'a': case 'arrowleft': c.left = true; break;
        case 'd': case 'arrowright': c.right = true; break;
        case 'shift': c.nitro = true; break;
        case ' ': c.drift = true; e.preventDefault(); break;
        case 'c':
          if (!cameraToggled.current) {
            c.cameraToggle = true;
            cameraToggled.current = true;
          }
          break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const c = controls.current;
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': c.forward = false; break;
        case 's': case 'arrowdown': c.backward = false; break;
        case 'a': case 'arrowleft': c.left = false; break;
        case 'd': case 'arrowright': c.right = false; break;
        case 'shift': c.nitro = false; break;
        case ' ': c.drift = false; break;
        case 'c': cameraToggled.current = false; break;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  return controls;
}
