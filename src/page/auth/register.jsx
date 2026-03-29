import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../Redux/authSlice';
import {  Link } from "react-router-dom";

const Register = () => {
    const dispatch = useDispatch();
    const { status, error } = useSelector(state => state.auth);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'admin',
    });

    // testadmin@gmail.com
    // testadmin123
    // Test 
    // Admin
    // 08020800009

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await dispatch(registerAdmin(formData));
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'admin' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
            <div className="w-full max-w-lg">
                {/* Card Container */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {
                        error && <p>{error}</p>
                    }
                    {/* Header */}
                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-secondary mb-2">Create Account</h1>
                        <p className="text-gray-500">Sign up to get started</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

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
                                    required
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
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
                                    required
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                spellCheck="false"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black-100"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

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

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-orange text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {status === 'loading' ? 'Please wait...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link
                                to="/"
                                className="text-primary font-medium hover:text-secondary transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;