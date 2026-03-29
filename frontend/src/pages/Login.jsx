import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import myLogo from '../assets/logo.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sol Panel: Görsel ve Karşılama (Büyük ekranlarda görünür) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900 opacity-90"></div>
        
        {/* Arka plan deseni (Opsiyonel) */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Tesisinizi <br /> 
            <span className="text-primary-200">Akıllıca Yönetin.</span>
          </h1>
          <p className="text-xl text-primary-100 max-w-md leading-relaxed">
            MLPCARE IWMS ile tüm tesis envanterinizi, bakım süreçlerinizi ve operasyonel verimliliğinizi tek bir platformdan takip edin.
          </p>
          
          <div className="mt-12 flex items-center space-x-4 text-sm text-primary-200">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-700 bg-primary-500 flex items-center justify-center text-[10px]">
                  User
                </div>
              ))}
            </div>
            <span>Binlerce varlık şu an güvende.</span>
          </div>
        </div>
      </div>

      {/* Sağ Panel: Login Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50 lg:bg-white">
        <div className="max-w-md w-full">
          {/* Mobil Logo (Sadece mobilde görünür) */}
          <div className="lg:hidden text-center mb-8">
             <img src={myLogo} alt="MLPCare Logo" className="mx-auto h-12 w-auto" />
          </div>

          {/* Masaüstü Logo & Başlık */}
          <div className="mb-10">
            <img src={myLogo} alt="MLPCare Logo" className="hidden lg:block h-12 w-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tekrar Hoş Geldiniz</h2>
            <p className="text-gray-500 mt-2">Lütfen hesabınıza giriş yapın.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kurumsal E-posta
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 shadow-sm"
                    placeholder="ad.soyad@mlpcare.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Şifre
                  </label>
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Şifremi Unuttum
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Beni hatırla
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş Yapılıyor...
                </span>
              ) : (
                <span className="flex items-center">
                  Giriş Yap <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              © 2026 MLPCare Varlık Yönetim Sistemi
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login