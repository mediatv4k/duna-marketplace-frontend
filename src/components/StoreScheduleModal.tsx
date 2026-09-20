'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, RefreshCw } from 'lucide-react';
import { getStoreSchedule } from '@/services/marketplaceService';

interface StoreScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number | string | null;
  storeName?: string;
}

// Claves `day` que devuelve GET /store/{id}/schedule/open, de lunes a domingo
const WEEK_DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

// "21:00" → "9:00 PM" (mismo formato que scheduleInfo: "Abre a las 12:00 PM")
function formatTime(time: unknown): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time ?? ''));
  if (!match) return '--';
  const hours24 = Number(match[1]);
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours24 % 12 || 12}:${match[2]} ${suffix}`;
}

// Día actual en la zona horaria de la plataforma (America/Caracas)
function todayKey(): string {
  try {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Caracas' }).toLowerCase();
  } catch {
    return '';
  }
}

export default function StoreScheduleModal({ isOpen, onClose, storeId, storeName }: StoreScheduleModalProps) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || storeId === null || storeId === undefined || storeId === '') return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRows([]);
    getStoreSchedule(storeId)
      .then((res) => {
        if (cancelled) return;
        if (res && res.code === 1 && Array.isArray(res.data)) {
          setRows(res.data);
        } else {
          setError(res?.message || 'No se pudo consultar el horario del comercio.');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo consultar el horario del comercio.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  const today = todayKey();

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[420px] max-h-[90vh] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#fe6712] px-5 py-3 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-[16px] leading-tight truncate">{storeName || 'Comercio'}</h3>
              <p className="text-[10px] font-medium text-white/90">Horario semanal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-7 h-7 text-[#fe6712] animate-spin" />
              <p className="text-xs font-bold text-slate-500">Consultando horario...</p>
            </div>
          ) : error ? (
            <p className="py-10 text-center text-xs font-bold text-red-600">{error}</p>
          ) : (
            <div className="space-y-1.5">
              {WEEK_DAYS.map((day) => {
                const dayRows = rows.filter((r) => String(r.day).toLowerCase() === day.key);
                const isToday = today === day.key;
                return (
                  <div
                    key={day.key}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${isToday ? 'border-[#fe6712]/50 bg-orange-50/70' : 'border-slate-100 bg-slate-50/60'}`}
                  >
                    <span className={`text-[12px] ${isToday ? 'font-black text-[#fe6712]' : 'font-bold text-slate-700'}`}>
                      {day.label}{isToday && <span className="ml-1.5 text-[8px] font-black uppercase tracking-wide">Hoy</span>}
                    </span>
                    {dayRows.length === 0 ? (
                      <span className="text-[11px] font-bold text-slate-400">Cerrado</span>
                    ) : (
                      <div className="text-right space-y-0.5">
                        {dayRows.map((r) => (
                          <div key={r.id ?? `${day.key}-${r.open_time}`} className="flex items-center justify-end gap-1.5">
                            <span className="text-[12px] font-black text-slate-900">
                              {formatTime(r.open_time)} – {formatTime(r.close_time)}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${r.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                              {r.status === 'ACTIVE' ? 'Activo' : String(r.status || 'Inactivo')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
