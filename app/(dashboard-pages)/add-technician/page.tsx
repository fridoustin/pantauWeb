'use client'

import { useState, useEffect } from "react";
import { Search, Plus, User, Mail, Phone, MapPin, Briefcase, CheckCircle, AlertCircle, X } from "lucide-react";
import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function AddTechnician() {
    const supabase = createClient()
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: ""
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            await signUpAction(formData);

            setShowSuccess(true);

            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "",
                password: ""
            });

            setRefresh(prev => !prev);
            
        } catch (error) {
            console.error("Gagal menambahkan teknisi:", error);
        }
    };

    const filteredTechnicians = technicians.filter(tech => {
        const term = searchTerm.toLowerCase();
        return (
            tech.name?.toLowerCase().includes(term) ||
            tech.email?.toLowerCase().includes(term) ||
            tech.phone?.toLowerCase().includes(term)
            );
    });      

    useEffect(() => {
        const fetchTechnicians = async () => {
            const { data, error } = await supabase
                .from('technician')
                .select('*')
                .order('name', { ascending: true });
            console.log("Fetched technicians:", data);
            
            if (error || !data) {
                console.error('Error fetching technicians: ', error);
                return;
            }
            if (data) {
                setTechnicians(data);
            }
        };
        fetchTechnicians();
    }, [refresh]);

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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Enter name"
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
                    value={formData.password}
                    onChange={handleChange}
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
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                    {filteredTechnicians.map((tech, idx) => (
                    <tr key={tech.id ?? idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tech.name ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech.email ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech.phone ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Technician
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        View Detail
                        </td>
                    </tr>
                    ))}
                    {filteredTechnicians.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No technicians found.
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
        {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowSuccess(false)}
                >
                </button>
                <div className="flex flex-col items-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <h3 className="text-lg font-semibold">Success!</h3>
                    <p className="text-sm text-gray-600 text-center">
                    Teknisi berhasil ditambahkan.
                    </p>
                    <Button onClick={() => setShowSuccess(false)}>OK</Button>
                </div>
                </div>
            </div>
        )}
        </div>
    );
}