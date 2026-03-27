import TravelCard from "../../components/TravelCard"

const Destinos = () => {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">

      <TravelCard
        nombre="Cancún Todo Incluido"
        precio={8500}
        cuposDisponibles={15}
        personasPorViaje={2}
      />

      <TravelCard
        nombre="Puerto Vallarta"
        precio={7200}
        cuposDisponibles={10}
        personasPorViaje={4}
      />

          <TravelCard
        nombre="Puerto Vallarta"
        precio={7200}
        cuposDisponibles={10}
        personasPorViaje={4}
      />
          <TravelCard
        nombre="Puerto Vallarta"
        precio={7200}
        cuposDisponibles={10}
        personasPorViaje={4}
      />

    </div>
  )
}

export default Destinos