interface InfoCardProps {
  title: string
  description: string
}

const InfoCard = ({ title, description }: InfoCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      
      <h3 className="text-xl font-semibold mb-3 text-gray-800">
        {title}
      </h3>

      <p className="text-gray-600">
        {description}
      </p>

    </div>
  )
}

export default InfoCard