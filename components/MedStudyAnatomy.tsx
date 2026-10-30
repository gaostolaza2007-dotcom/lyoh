'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback, useState } from 'react';
import { Compass, Hand, Lock } from 'lucide-react';

export type RegionId =
  | 'skin'
  | 'mouth'
  | 'nose'
  | 'small_intestine'
  | 'colon'
  | 'vulva'
  | 'vagina'
  | 'penis'
  | 'glans'
  | 'eye'
  | 'ear'
  | 'stomach'
  | 'urethra';

export type AnatomyVariant = 'female' | 'male';

export type RegionSelection = {
  regionId: RegionId;
  variant: AnatomyVariant;
  status: 'available' | 'pending';
};

export type AnatomyHandle = {
  selectRegion: (regionId: RegionId, variant?: AnatomyVariant) => void;
  changeVariant: (variant: AnatomyVariant) => void;
  reset: () => void;
  orient: (side: 'front' | 'back') => void;
  zoom: (factor: number) => void;
};

export interface MedStudyAnatomyProps {
  onRegionChange?: (region: RegionSelection) => void;
  onOpenEntry?: (entryId: string) => void;
  onReady?: () => void;
  onError?: (err: string) => void;
  className?: string;
  src?: string;
}

/**
 * Adaptador React para el visor 3D anatómico incrustado en iframe del mismo origen.
 * Incluye gestión de gestos táctiles cooperativos en móvil, soporte de orientación,
 * seguimiento de errores y preservación de estado.
 */
export const MedStudyAnatomy = forwardRef<AnatomyHandle, MedStudyAnatomyProps>(
  function MedStudyAnatomy(
    { onRegionChange, onOpenEntry, onReady, onError, className, src = '/medstudy-anatomy/index.html?embed=1' },
    ref
  ) {
    const frame = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ready = useRef(false);
    const queued = useRef<Record<string, unknown>[]>([]);
    const callback = useRef(onRegionChange);
    const openEntryCallback = useRef(onOpenEntry);
    const onReadyCallback = useRef(onReady);
    const onErrorCallback = useRef(onError);

    // Estado para modo táctil cooperativo en celulares: evita atrapar el scroll de la página
    const [isTouchActive, setIsTouchActive] = useState(false);

    useEffect(() => {
      callback.current = onRegionChange;
    }, [onRegionChange]);

    useEffect(() => {
      openEntryCallback.current = onOpenEntry;
    }, [onOpenEntry]);

    useEffect(() => {
      onReadyCallback.current = onReady;
    }, [onReady]);

    useEffect(() => {
      onErrorCallback.current = onError;
    }, [onError]);

    const send = useCallback((command: Record<string, unknown>) => {
      if (!ready.current) {
        queued.current.push(command);
        return;
      }
      try {
        frame.current?.contentWindow?.postMessage(
          { type: 'medstudy:command', ...command },
          window.location.origin
        );
      } catch (err) {
        console.warn('[MedStudyAnatomy] Error enviando comando postMessage:', err);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        selectRegion: (regionId, variant) => send({ action: 'select', regionId, variant }),
        changeVariant: (variant) => send({ action: 'variant', variant }),
        reset: () => send({ action: 'reset' }),
        orient: (side) => send({ action: 'orient', side }),
        zoom: (factor) => send({ action: 'zoom', factor }),
      }),
      [send]
    );

    const markReadyAndFlush = useCallback(() => {
      ready.current = true;
      onReadyCallback.current?.();
      const pending = queued.current.splice(0);
      for (const cmd of pending) {
        send(cmd);
      }
    }, [send]);

    useEffect(() => {
      ready.current = false;

      const receive = (event: MessageEvent) => {
        if (typeof window === 'undefined') return;
        if (event.origin !== window.location.origin) return;
        if (!frame.current || event.source !== frame.current.contentWindow) return;

        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // Señal de inicialización lista enviada por app.js
        if (data.type === 'medstudy:ready') {
          markReadyAndFlush();
        }

        // Error reportado desde el visor
        if (data.type === 'medstudy:error' && typeof data.error === 'string') {
          onErrorCallback.current?.(data.error);
        }

        // Cambio de región originado dentro del iframe (clic en marcador)
        if (data.type === 'medstudy:regionchange') {
          const { regionId, variant, status } = data;
          if (typeof regionId === 'string' && (variant === 'female' || variant === 'male')) {
            callback.current?.({
              regionId: regionId as RegionId,
              variant: variant as AnatomyVariant,
              status: status === 'available' ? 'available' : 'pending',
            });
          }
        }

        // Solicitud de apertura de ficha desde el visor
        if (data.type === 'medstudy:openentry' && typeof data.entryId === 'string') {
          openEntryCallback.current?.(data.entryId);
        }
      };

      window.addEventListener('message', receive);

      return () => {
        ready.current = false;
        window.removeEventListener('message', receive);
      };
    }, [src, markReadyAndFlush]);

    // Respaldo de comprobación al cargar/recargar el iframe
    const handleFrameLoad = () => {
      try {
        const cw = frame.current?.contentWindow as any;
        if (cw && cw.medstudy && !ready.current) {
          markReadyAndFlush();
        }
      } catch {
        // En caso de demora, el mensaje postMessage "medstudy:ready" se encargará
      }
    };

    return (
      <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden rounded-2xl">
        <iframe
          ref={frame}
          src={src}
          onLoad={handleFrameLoad}
          title="Explorador corporal 3D"
          className={`${className ?? 'w-full h-full border-none'} ${
            isTouchActive ? 'pointer-events-auto' : 'pointer-events-none sm:pointer-events-auto'
          }`}
          style={{ width: '100%', height: '100%', border: 0 }}
        />

        {/* Capa de control táctil cooperativo en móvil: evita que el gesto de scroll quede atrapado */}
        {!isTouchActive && (
          <div
            onClick={() => setIsTouchActive(true)}
            className="sm:hidden absolute inset-0 z-10 flex flex-col justify-end items-center pb-3 cursor-pointer"
            aria-label="Toca para interactuar con el modelo 3D"
          >
            <div className="px-3.5 py-2 rounded-full bg-slate-950/85 border border-purple-500/40 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold text-white pointer-events-auto min-h-[44px]">
              <Hand className="w-3.5 h-3.5 text-purple-400" />
              <span>Toca para explorar en 3D</span>
            </div>
          </div>
        )}

        {/* Botón flotante para desbloquear desplazamiento de la página una vez activado el 3D */}
        {isTouchActive && (
          <div className="sm:hidden absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={() => setIsTouchActive(false)}
              className="px-3 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/50 shadow-lg backdrop-blur-md flex items-center gap-1.5 text-[11px] font-semibold text-purple-200 pointer-events-auto min-h-[44px]"
              aria-label="Bloquear modelo 3D y permitir desplazamiento vertical de la página"
            >
              <Lock className="w-3.5 h-3.5 text-purple-300" />
              <span>Desplazar página</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

MedStudyAnatomy.displayName = 'MedStudyAnatomy';
export default MedStudyAnatomy;
