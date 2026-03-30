import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '../../Redux/authSlice';
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const dispatch = useDispatch();
    const { status } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(adminLogin({
            email: formData.email,
            password: formData.password,
        }));
        setFormData({ email: '', password: '' });

        if (adminLogin.fulfilled.match(result)) {
            navigate("/home-admin");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
            <div className="w-full max-w-lg">
                {/* Card Container */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-secondary mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-secondary transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div> */}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-orange text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {status === 'loading' ? 'Please wait...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                to="/reg-admin"
                                className="text-primary font-medium hover:text-secondary transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{' '}
                        <button className="text-primary hover:text-secondary font-medium">
                            Contact Support
                        </button>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;