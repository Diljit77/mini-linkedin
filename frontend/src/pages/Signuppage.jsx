import React, { use, useState } from 'react'
import { Lock, Mail, User } from 'lucide-react'
import { Signup } from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
const Signuppage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', })
      const [loading, setLoading] = useState(false);
      const {theme}= useThemeStore();
      const navigate=useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
       try {

          const data=await Signup(form);
  
        toast.success('Signup successful!');
        navigate('/login');
        } catch (error) {
      console.log(error)
        }finally{
setLoading(false);
        }
  }

  return (
     <div className="min-h-screen flex items-center justify-center bg-base-100" data-theme={theme}>
      <div className="card w-full max-w-md shadow-lg p-8 bg-base-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="form-control">
            <label className="label">Full Name</label>
            <div className="relative">
              <input
              name='name'
              value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full pl-10"
              />
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">Email</label>
            <div className="relative">
              <input
              name='email'
              value={form.email}
              onChange={handleChange}
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full pl-10"
              />
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">Password</label>
            <div className="relative">
              <input
                      name='password'
              value={form.password}
              onChange={handleChange}
                type="password"
                placeholder="********"
                className="input input-bordered w-full pl-10"
              />
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading===true ? 'Signing up...' : 'Sign Up'}</button>
     
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}

export default Signuppage;

