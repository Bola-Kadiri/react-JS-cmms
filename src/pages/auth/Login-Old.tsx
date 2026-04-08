import SignInForm from "@/components/auth/SignInForm"
import signInHero from "@/assets/sign-in-hero.png"

const Login = () => {
    return (
        <section 
            className="bg-cover bg-center w-full h-[100vh]"
            style={{ backgroundImage: `url('/images/bg-img.jpg')` }}
        >
            <div className="grid grid-cols-[40%_60%] h-[100%] items-center">
            <SignInForm />
            <img src={signInHero} alt="Sign in Hero Image" className="w-full" />
            </div>
        </section>
    )
}

export default Login