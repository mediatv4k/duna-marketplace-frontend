'use client';

import { useState } from 'react';
// Importamos tu propio motor de logística original
import { calculateLogistics, PhysicalItem, LogisticsResult } from '@/lib/logisticsEngine';

export default function TestLogistica() {
  const [resultado, setResultado] = useState<LogisticsResult | null>(null);

  const probarMoto = () => {
    const carritoPequeño: PhysicalItem[] = [
      { nombre: 'Hamburguesa con Papas', precio: 10, cantidad: 2, pesoKg: 0.5, largoCm: 20, anchoCm: 15, altoCm: 10 }
    ];
    // Calculamos para 3 kilómetros
    setResultado(calculateLogistics(carritoPequeño, 3));
  };

  const probarCamioneta = () => {
    const carritoGigante: PhysicalItem[] = [
      { nombre: 'Televisor 65 Pulgadas', precio: 400, cantidad: 1, pesoKg: 25, largoCm: 150, anchoCm: 90, altoCm: 15 },
      { nombre: 'Nevera Ejecutiva', precio: 250, cantidad: 1, pesoKg: 45, largoCm: 60, anchoCm: 60, altoCm: 120 }
    ];
    // Calculamos para 3 kilómetros
    setResultado(calculateLogistics(carritoGigante, 3));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-black">🧪 Cuarto de Pruebas</h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={probarMoto} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition cursor-pointer">
          🛵 Probar Pedido Pequeño
        </button>
        <button onClick={probarCamioneta} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition cursor-pointer">
          🛻 Probar Pedido Gigante
        </button>
      </div>

      {resultado && (
        <div className="bg-white p-8 rounded-xl shadow-2xl text-black border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            {resultado.vehiculoAsignado.nombre} {resultado.vehiculoAsignado.icono}
          </h2>
          <ul className="space-y-2 text-lg">
            <li><strong>Motivo:</strong> {resultado.motivoAsignacion}</li>
            <li><strong>Peso Facturable:</strong> {resultado.pesoFacturableKg} kg</li>
            <li><strong>Volumen Total:</strong> {resultado.volumenTotalCm3} cm³</li>
            <li className="text-green-600 font-bold text-xl pt-2 border-t">
              Costo de Envío: ${resultado.costoEnvioUSD}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}