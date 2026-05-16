import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,

} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(email, name, password);

      toast.success("Account created!");

      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#c49456] relative font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#fffaf5]/95 border border-white/70 rounded-[36px] p-8 shadow-[0_40px_100px_rgba(60,25,5,0.22)] backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 bg-[#f7e8d0] text-[#623810] px-4 py-2 rounded-full text-sm font-medium mb-6">
            ✨ Create Account
          </div>

          <h2 className="text-5xl font-black text-[#2e1706] mb-3">
            Sign Up
          </h2>

          <p className="text-[#7a5c3e] mb-8">
            Create your account and start building live polls.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-sm font-medium text-[#2e1706] mb-2 block">
                Full Name
              </label>

              <div className="h-14 rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-[#8b401040] focus-within:border-[#8b4010] transition-all duration-300">
                <User className="w-5 h-5 text-[#8b6b4a]" />

                <input
                  type="text"
                  placeholder="Your name"
                  className="flex-1 bg-transparent outline-none text-[#2e1706] placeholder:text-[#b08968]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-[#2e1706] mb-2 block">
                Email Address
              </label>

              <div className="h-14 rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-[#8b401040] focus-within:border-[#8b4010] transition-all duration-300">
                <Mail className="w-5 h-5 text-[#8b6b4a]" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-[#2e1706] placeholder:text-[#b08968]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-[#2e1706] mb-2 block">
                Password
              </label>

              <div className="h-14 rounded-2xl border border-[#e8d5b8] bg-[#fffaf3] flex items-center px-4 gap-3 focus-within:ring-4 focus-within:ring-[#8b401040] focus-within:border-[#8b4010] transition-all duration-300">
                <Lock className="w-5 h-5 text-[#8b6b4a]" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
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
              className="w-full h-14 rounded-2xl bg-[#2e1706] text-white font-bold hover:-translate-y-1 transition-all duration-300 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#7a5c3e]">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-[#8b4010] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}