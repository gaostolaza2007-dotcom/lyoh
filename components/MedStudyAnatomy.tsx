'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from 'react';

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
};

export interface MedStudyAnatomyProps {
  onRegionChange?: (region: RegionSelection) => void;
  onOpenEntry?: (entryId: string) => void;
  onReady?: () => void;
  className?: string;
  src?: string;
}

/**
 * Adaptador React para el visor 3D anatómico incrustado en iframe del mismo origen.
 * Gestiona cola de comandos, ciclo de vida del iframe, validación bidireccional y limpieza de listeners.
 */
export const MedStudyAnatomy = forwardRef<AnatomyHandle, MedStudyAnatomyProps>(
  function MedStudyAnatomy(
    { onRegionChange, onOpenEntry, onReady, className, src = '/medstudy-anatomy/index.html?embed=1' },
    ref
  ) {
    const frame = useRef<HTMLIFrameElement>(null);
    const ready = useRef(false);
    const queued = useRef<Record<string, unknown>[]>([]);
    const callback = useRef(onRegionChange);
    const openEntryCallback = useRef(onOpenEntry);
    const onReadyCallback = useRef(onReady);

    useEffect(() => {
      callback.current = onRegionChange;
    }, [onRegionChange]);

    useEffect(() => {
      openEntryCallback.current = onOpenEntry;
    }, [onOpenEntry]);

    useEffect(() => {
      onReadyCallback.current = onReady;
    }, [onReady]);

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
        // Validación estricta de origen y de la ventana emisora
        if (typeof window === 'undefined') return;
        if (event.origin !== window.location.origin) return;
        if (!frame.current || event.source !== frame.current.contentWindow) return;

        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // Señal de inicialización lista enviada por app.js
        if (data.type === 'medstudy:ready') {
          markReadyAndFlush();
        }

        // Cambio de región originado dentro del iframe (clic en marcador, lista o botón)
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

        // Solicitud de apertura de ficha desde el panel del visor
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
      <iframe
        ref={frame}
        src={src}
        onLoad={handleFrameLoad}
        title="Explorador de regiones de la microbiota humana"
        className={
          className ??
          'w-full h-[460px] sm:h-[520px] md:h-[620px] xl:h-[700px] rounded-2xl border border-white/10 bg-[#101019] shadow-2xl'
        }
        style={{ width: '100%', border: 0 }}
      />
    );
  }
);

MedStudyAnatomy.displayName = 'MedStudyAnatomy';
export default MedStudyAnatomy;
