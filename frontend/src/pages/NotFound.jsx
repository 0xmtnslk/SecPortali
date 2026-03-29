import { useNavigate } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 mb-8">
          Aradığınız sayfa bulunamadı veya silinmiş olabilir.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          <Home className="h-5 w-5 mr-2" />
          Portal'a Dön
        </button>
      </div>
    </div>
  )
}

export default NotFound
