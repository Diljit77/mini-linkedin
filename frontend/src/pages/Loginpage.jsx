import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { login } from '../utils/api'
import toast from 'react-hot-toast'
import { useThemeStore } from '../store/useThemeStore';

function Loginpage() {
  const {theme}= useThemeStore();
      const [form, setForm] = useState({  email: '', password: '', });
      const [loading, setLoading] = useState(false);

      const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
      }
    
      const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
          console.log(form)
          const data=await login(form);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success('Login successful!');
       window.location.href = "/";
        } catch (error) {
      console.log(error)
        }finally{
setLoading(false);
   
        }
      
     
      }
  return (
     <div className="min-h-screen flex items-center justify-center bg-base-100" data-theme={theme}>
      <div className="card w-full max-w-md shadow-lg p-8 bg-base-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <div className="relative">
              <input
              name='email'
              value={form.email}
              onChange={handleChange}
                type="email"
                placeholder="Enter email"
                className="input input-bordered w-full pl-10"
              />
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <input
              name='password'
              value={form.password}
              onChange={handleChange}
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full pl-10"
              />
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">{
            loading ? 'Logging in...' : 'Log In'}</button>
       
      
        </form>
        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}

export default Loginpage;
