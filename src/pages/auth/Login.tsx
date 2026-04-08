import SignInForm from "@/components/auth/SignInForm";
import signInHero from "@/assets/sign-in-hero.png"

const Login = () => {
  return (
    <section 
      className="bg-cover bg-center w-full min-h-screen relative"
      style={{ backgroundImage: `url('/images/bg-img.jpg')` }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/70 via-white/50 to-green-100/70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 1200 800" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e7ff" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Geometric shapes */}
        <div className="absolute top-10 right-20 w-32 h-32 border-2 border-green-200 rounded-lg transform rotate-12 opacity-30"></div>
        <div className="absolute top-40 left-10 w-24 h-24 border-2 border-green-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border border-green-200 transform rotate-45 opacity-15"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6">
        <div className="text-3xl font-bold text-slate-700">
          ALPHA CMMS
        </div>
        <nav className="flex space-x-8">
          <a href="#" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">HOME</a>
          <a href="#" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">ABOUT US</a>
          <a href="#" className="text-slate-800 font-semibold border-b-2 border-slate-800">LOG IN</a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[40%_60%] h-[calc(100vh-88px)] items-center px-8">
        {/* Sign In Form */}
        <div className="flex justify-center lg:justify-start lg:pl-12">
          <SignInForm />
        </div>
        
        {/* Hero Image */}
        <div className="hidden lg:flex justify-center items-center">
          <img 
            src={signInHero} 
            alt="Sign in Hero Image" 
            className="w-full max-w-2xl h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;