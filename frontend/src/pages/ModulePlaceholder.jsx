import { Link } from 'react-router-dom'
import { Home, Construction } from 'lucide-react'

const ModulePlaceholder = ({ title, icon: Icon, color }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className={`p-6 rounded-3xl bg-white shadow-xl mb-8 flex items-center justify-center`}>
        <Icon className={`h-24 w-24 ${color}`} />
      </div>
      
      <h1 className="text-4xl font-black text-gray-900 mb-4 text-center">
        {title}
      </h1>
      
      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full mb-8 font-bold animate-pulse">
        <Construction className="h-5 w-5" />
        <span>Geliştirme Aşamasında</span>
      </div>
      
      <p className="text-gray-500 text-center max-w-md mb-12 text-lg leading-relaxed">
        Bu modül şu anda yapılandırılmaktadır. Çok yakında tüm özellikleri ile hizmetinizde olacaktır.
      </p>
      
      <Link
        to="/"
        className="flex items-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
      >
        <Home className="h-5 w-5 mr-3" />
        Portal Ana Sayfasına Dön
      </Link>
    </div>
  )
}

export default ModulePlaceholder
