interface StatCardProps {
  title: string
  number: number
  details: Array<{ label: string; value: number; color?: string }>
  colorIndex: number
}

export function StatCard({ title, number, details, colorIndex }: StatCardProps) {
  const colors = [
    { gradient: "from-orange-400 to-orange-600", text: "text-orange-500" },
    { gradient: "from-blue-400 to-blue-600", text: "text-blue-500" },
    { gradient: "from-green-400 to-green-600", text: "text-green-500" },
    { gradient: "from-yellow-400 to-yellow-600", text: "text-yellow-500" },
  ]

  const color = colors[colorIndex % colors.length]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color.gradient}`}></div>

      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">{title}</h3>

      <div className={`text-4xl font-bold mb-4 ${color.text}`}>{number}</div>

      <div className="space-y-2 pt-4 border-t border-gray-100">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{detail.label}</span>
            <span className={`font-semibold ${detail.color || "text-gray-800"}`}>{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
