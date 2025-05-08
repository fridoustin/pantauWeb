'use client'

import { useState, useEffect } from "react";
import { Search, Plus, User, Mail, Phone, MapPin, Briefcase, CheckCircle, AlertCircle, X } from "lucide-react";
import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function AddTechnician() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: ""
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    return (
        <div className="p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-3xl font-bold text-gray-800">Add Technician</h1>
            </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-lg shadow p-6">
            <form action={signUpAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                Full Name
                </label>
                <div className="flex items-center border rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50">
                    <User className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="Enter technician's full name"
                    required
                />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                Email Address
                </label>
                <div className="flex items-center border rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="Enter email address"
                    required
                />
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                Phone Number
                </label>
                <div className="flex items-center border rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50">
                    <Phone className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="Enter phone number"
                    required
                />
                </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                Role
                </label>
                <div className="flex items-center border rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                </span>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 outline-none appearance-none bg-transparent"
                    required
                >
                    <option value="" disabled>Select specialization</option>
                    <option value="technician">Technician</option>
                </select>
                </div>
            </div>
            
            {/* Password field - required for Supabase signup */}
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                Password
                </label>
                <div className="flex items-center border rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50">
                    <User className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="password"
                    name="password"
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="Enter temporary password"
                    required
                />
                </div>
                <p className="text-xs text-gray-500">
                {/* This temporary password will be sent to the technician's email */}
                </p>
            </div>
            
            {/* Submit button in form */}
            <div className="md:col-span-2 flex justify-end mt-4">
                <Button
                className="flex items-center gap-2"
                    type="submit"
                >
                <Plus className="h-4 w-4" />
                    Add Technician
                </Button>
            </div>
            </form>
        </div>

        {/* Technician List */}
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Current Technicians</h2>
            <div className="relative">
                <input
                type="text"
                placeholder="Search technicians..."
                className="pl-10 pr-4 py-2 border rounded-md"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {[
                    { id: 1, name: "Mirsa Bintang", email: "mirsa@example.com", phone: "0812-3456-7890", role: "Technician" }
                ].map((tech) => (
                    <tr key={tech.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tech.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        View Detail
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}