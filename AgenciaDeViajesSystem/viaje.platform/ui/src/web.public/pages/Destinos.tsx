import { useEffect, useState } from "react"
import TravelCard from "../../components/TravelCard"

interface Viaje {
  id: number
  title: string
  description: string
  destination: string
  price: number
  available_seats: number
  start_date: string
  end_date: string
}

const Destinos = () => {

  const [viajes, setViajes] = useState<Viaje[]>([])

  useEffect(() => {
    fetch("http://localhost/AgenciaDeViajesSystem/API/API_getviajes.php")
      .then(response => response.json())
      .then(data => setViajes(data))
  }, [])

  return (
    <div className="grid grid-cols-3 gap-6 p-6">

      {viajes.map((viaje) => (
        <TravelCard
          key={viaje.id}
          nombre={viaje.title}
          precio={viaje.price}
          cuposDisponibles={viaje.available_seats}
          personasPorViaje={2}
        />
      ))}

    </div>
  )
}

export default Destinos