; 'tsx'
export default function DollarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Dólar</h1>

      {/* Actualización del dólar */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Actualizar cotización del dólar</h2>
        <form>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="dollarBlue" className="block text-sm font-medium text-gray-700">
                Dólar Blue
              </label>
              <input
                type="number"
                id="dollarBlue"
                name="dollarBlue"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese cotización"
              />
            </div>
            <div>
              <label htmlFor="dollarOfficial" className="block text-sm font-medium text-gray-700">
                Dólar Oficial
              </label>
              <input
                type="number"
                id="dollarOfficial"
                name="dollarOfficial"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ingrese cotización"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            Actualizar
          </button>
        </form>
      </div>
    </div>
  )
}
