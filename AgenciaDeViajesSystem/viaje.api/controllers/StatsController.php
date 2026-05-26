<?php

class StatsController {
    public static function index(Request $request): void {
        $db = Database::connect();

        // Viajes realizados = ventas confirmadas
        $viajesRealizados = (int) $db->query(
            "SELECT COUNT(*) FROM ventas WHERE estado = 'Confirmada'"
        )->fetchColumn();

        // Personas que han viajado = suma de personas en ventas confirmadas
        $personasViajeras = (int) $db->query(
            "SELECT COALESCE(SUM(personas), 0) FROM ventas WHERE estado = 'Confirmada'"
        )->fetchColumn();

        // Ciudades visitadas = destinos distintos del catálogo Activo
        $ciudadesVisitadas = (int) $db->query(
            "SELECT COUNT(DISTINCT destination) FROM viajes WHERE estado = 'Activo'"
        )->fetchColumn();

        // Satisfacción = % derivado del rating promedio de experiencias visibles (1-5 → 0-100).
        // Si no hay experiencias, fallback al rating promedio de viajes activos.
        $avgExperiencias = $db->query(
            "SELECT AVG(rating) FROM experiencias WHERE visible = 1"
        )->fetchColumn();

        if ($avgExperiencias === null || $avgExperiencias === false) {
            $avgViajes = $db->query(
                "SELECT AVG(rating) FROM viajes WHERE estado = 'Activo' AND rating > 0"
            )->fetchColumn();
            $avgRating = $avgViajes !== false && $avgViajes !== null ? (float) $avgViajes : 0.0;
        } else {
            $avgRating = (float) $avgExperiencias;
        }

        $satisfaccion = (int) round(($avgRating / 5) * 100);

        Response::success([
            'viajes_realizados'  => $viajesRealizados,
            'personas_viajeras'  => $personasViajeras,
            'ciudades_visitadas' => $ciudadesVisitadas,
            'satisfaccion'       => $satisfaccion,
        ]);
    }
}
