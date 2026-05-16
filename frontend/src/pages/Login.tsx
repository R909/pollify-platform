import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import loginImage from "../assets/images/login-image.png";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login(email, password);

      toast.success("Welcome back!");

      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }

   
  };
  return (
    <div className="min-h-screen overflow-hidden bg-[#c49456] relative font-sans">
      <div className="relative z-10 max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2 items-center px-6 lg:px-16 pt-24 pb-8 gap-8">
        <div className="hidden lg:flex relative items-center justify-center h-full">
          <div className="relative w-full flex justify-center isolate overflow-visible">
            <div className="absolute bottom-0 w-[320px] h-[70px] bg-yellow-200/40 blur-3xl rounded-full z-0" />

            <img
              src={loginImage}
              alt="Login"
              className="relative z-10 w-[360px] object-contain drop-shadow-[0_40px_60px_rgba(40,15,0,0.28)] animate-float"
            />

            <div className="absolute top-8 left-[-40px] z-30 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-[180px] text-white shadow-xl">
              <div className="text-[11px] opacity-80 mb-2 uppercase tracking-wider">
                Live Poll Results
              </div>

              <div className="text-[13px] font-medium mb-2">
                ☕ Favourite brew?
              </div>

              <div className="text-[12px] opacity-80">Flat White</div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="w-[68%] h-full bg-white rounded-full" />
              </div>

              <div className="text-[12px] opacity-80">Espresso</div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="w-[22%] h-full bg-white rounded-full" />
              </div>

              <div className="text-[12px] opacity-80">Cold Brew</div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="w-[10%] h-full bg-white rounded-full" />
              </div>
            </div>

            <div className="absolute bottom-8 right-[-40px] z-40 bg-white/25 backdrop-blur-xl border border-white/30 rounded-2xl p-4 w-[145px] text-center text-white shadow-xl">
              <div className="text-3xl font-black leading-none">
                1,284
              </div>

              <div className="text-[11px] opacity-80 mt-1 tracking-wide">
                responses today
              </div>
            </div>

            <div className="absolute top-0 right-[10px] z-40 bg-[#fffaf5] text-[#2e1706] rounded-2xl px-4 py-2 shadow-xl text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-[#c68a3e] rounded-full animate-pulse" />
               Hey! Sign in to get started 😊
            </div>
          </div>
        </div>

        <div className="bg-[#fffaf5]/95 border border-white/70 rounded-[32px] p-7 lg:p-9 shadow-[0_40px_100px_rgba(60,25,5,0.22)] backdrop-blur-xl max-w-lg w-full mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f7e8d0] text-[#623810] px-4 py-2 rounded-full text-sm font-medium mb-5">
            ✨ Welcome Back
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-[#2e1706] mb-3">
            Sign In
          </h2>

          <p className="text-[#7a5c3e] mb-7 text-sm lg:text-base">
            Access your polls, analytics, and audience insights.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm font-medium text-[#2e1706] mb-2 block">
                Email Address
              </label>

              <div className="h-14 rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-[#8b401040] focus-within:border-[#8b4010] transition-all duration-300">
                <Mail className="w-5 h-5 text-[#8b6b4a]" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none text-[#2e1706] placeholder:text-[#b08968]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-[#2e1706] mb-2 block">
                Password
              </label>

              <div className="h-14 rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-[#8b401040] focus-within:border-[#8b4010] transition-all duration-300">
                <Lock className="w-5 h-5 text-[#8b6b4a]" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-[#2e1706] placeholder:text-[#b08968]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8b6b4a]"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#2e1706] text-white font-bold hover:-translate-y-1 transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-[#ead8c0]" />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#9a7a57]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-[#ead8c0]" />
            </div>

            {/* <div className="rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"> */}
              <div className="h-12 rounded-xl border border-[#e1ccb0] bg-white flex items-center justify-center overflow-hidden hover:bg-[#fffdfa] transition-colors duration-300">
              <GoogleLogin
                shape="pill"
                size="large"
                text="signin_with"
                width="360"
                onSuccess={async (credentialResponse) => {
                const idToken = credentialResponse.credential;
                if (!idToken) {
                  toast.error("Google sign-in failed");
                  return;
                }
                try {
                  setLoading(true);
                  await googleLogin(idToken);
                  toast.success("Welcome back!");
                  navigate("/dashboard");
                } catch (err: any) {
                  toast.error(err.response?.data?.error || "Google login failed");
                } finally {
                  setLoading(false);
                }
              }}
                onError={() => toast.error("Google sign-in failed")}
              />
              </div>
            {/* </div> */}
          </div>

          <p className="text-center mt-5 text-sm text-[#7a5c3e]">
            No account?{" "}
            <Link
              to="/register"
              className="text-[#8b4010] font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
