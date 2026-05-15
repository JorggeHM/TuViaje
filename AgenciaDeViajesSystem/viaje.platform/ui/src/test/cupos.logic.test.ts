import { describe, it, expect } from 'vitest';

/**
 * Tests de la lógica pura de cálculo de cupos de ViajeDetalle.tsx.
 * Esta lógica no depende de React — se extrae y prueba en aislamiento.
 */

// Replicación exacta de las fórmulas de ViajeDetalle.tsx
const calcPctDisponible = (cuposDisponibles: number, totalAsientos?: number) => {
  const totalRef = totalAsientos && totalAsientos > 0 ? totalAsientos : Math.max(cuposDisponibles, 1);
  return Math.min((cuposDisponibles / totalRef) * 100, 100);
};

const calcMaxPersonas = (cuposDisponibles: number, personasPorViaje: number) =>
  Math.min(cuposDisponibles, personasPorViaje);

const calcCuposTrasReserva = (cuposActuales: number, personasReservadas: number) =>
  Math.max(0, cuposActuales - personasReservadas);

describe('Lógica de disponibilidad — barra de progreso', () => {

  it('0% disponible cuando no quedan cupos', () => {
    expect(calcPctDisponible(0, 20)).toBe(0);
  });

  it('100% disponible cuando todos los cupos están libres', () => {
    expect(calcPctDisponible(20, 20)).toBe(100);
  });

  it('50% disponible cuando quedan la mitad de cupos', () => {
    expect(calcPctDisponible(10, 20)).toBe(50);
  });

  it('cálculo correcto con viaje de 100 cupos del que quedan 30', () => {
    expect(calcPctDisponible(30, 100)).toBe(30);
  });

  it('sin totalAsientos usa cuposDisponibles como referencia → siempre 100%', () => {
    // Si no tenemos el total, la barra se muestra llena (fallback seguro)
    expect(calcPctDisponible(5)).toBe(100);
  });

  it('no supera el 100% aunque cuposDisponibles > totalAsientos', () => {
    // Caso de datos inconsistentes en BD
    expect(calcPctDisponible(25, 20)).toBe(100);
  });
});

describe('Lógica del selector de personas — límite máximo', () => {

  it('máximo = cuposDisponibles cuando cupos < personasPorViaje', () => {
    expect(calcMaxPersonas(1, 5)).toBe(1);
  });

  it('máximo = personasPorViaje cuando cupos > personasPorViaje', () => {
    expect(calcMaxPersonas(10, 3)).toBe(3);
  });

  it('máximo = 0 cuando no hay cupos → botón + bloqueado', () => {
    expect(calcMaxPersonas(0, 5)).toBe(0);
  });

  it('máximo = ambos son iguales', () => {
    expect(calcMaxPersonas(4, 4)).toBe(4);
  });
});

describe('Lógica de actualización local de cupos tras reserva', () => {

  it('resta correctamente las personas de los cupos', () => {
    expect(calcCuposTrasReserva(10, 3)).toBe(7);
  });

  it('no baja de 0 aunque se reserven más de los disponibles', () => {
    expect(calcCuposTrasReserva(1, 5)).toBe(0);
  });

  it('queda 0 al reservar todos los cupos disponibles', () => {
    expect(calcCuposTrasReserva(5, 5)).toBe(0);
  });

  it('reserva de 1 persona resta 1 cupo', () => {
    expect(calcCuposTrasReserva(8, 1)).toBe(7);
  });
});
