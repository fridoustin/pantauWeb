export const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow text-center">
    <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
)
