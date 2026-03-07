import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, registerAdmin } from '../Redux/authSlice';
import { useNavigate } from "react-router-dom";

const Login = () => {
    const dispatch = useDispatch();
    const { status, error } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'admin'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            const result = await dispatch(adminLogin({
                email: formData.email,
                password: formData.password,
            }));

            setTimeout(() => {
                console.log('Attempting navigation to /app/sendrey');
                navigate("/app/sendrey");
            }, 2000);
        } else {
            await dispatch(registerAdmin(formData));
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'admin'
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
            <div className="w-full max-w-lg">
                {/* Card Container */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-secondary mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500">
                            {isLogin
                                ? 'Sign in to continue to your account'
                                : 'Sign up to get started'
                            }
                        </p>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${isLogin
                                ? 'bg-primary text-white'
                                : 'bg-transparent text-gray-500 hover:text-secondary'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${!isLogin
                                ? 'bg-primary text-white'
                                : 'bg-transparent text-gray-500 hover:text-secondary'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error Message */}
                    {/* {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )} */}
                    {/* toast instead    */}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Register Fields */}
                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                            placeholder="+234 800 000 0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="super-admin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Common Fields */}
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Forgot Password - Login Only */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:text-secondary transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {status === 'loading'
                                ? 'Please wait...'
                                : isLogin ? 'Sign In' : 'Create Account'
                            }
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-primary font-medium hover:text-secondary transition-colors"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>

                    {/* Terms - Register Only */}
                    {!isLogin && (
                        <div className="mt-4">
                            <p className="text-xs text-center text-gray-500">
                                By signing up, you agree to our{' '}
                                <button className="text-primary hover:text-secondary">
                                    Terms of Service
                                </button>{' '}
                                and{' '}
                                <button className="text-primary hover:text-secondary">
                                    Privacy Policy
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{' '}
                        <button className="text-primary hover:text-secondary font-medium">
                            Contact Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;