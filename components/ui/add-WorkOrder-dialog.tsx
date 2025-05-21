"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";// Pastikan komponen ini sudah terinstall
import { createClient } from "@/utils/supabase/client";
import { DatePicker } from "../DatePicker";
import { AArrowUp } from "lucide-react";

interface Technician {
    technician_id: string;
    name: string;
}

interface Categories {
    category_id: string;
    lantai: string;
}

interface Admins {
    admin_id: string;
    name: string;
}

interface AddWorkOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddWorkOrder: (data: any) => void;
    now: Date;
}

export function AddWorkOrderDialog({
    open,
    onOpenChange,
    onAddWorkOrder,
    now,
}: AddWorkOrderDialogProps) {
    const supabase = createClient()
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [admins, setAdmins] = useState<Admins[]>([]);

    const form = useForm({
        defaultValues: {
            title: "",
            description: "",
            technician_id: "",
            category_id: "",
            start_time: new Date(),
            admin_id: ""
        },
    });

    // Fetch technicians from Supabase
    useEffect(() => {
        const fetchTechnicians = async () => {
            const { data, error } = await supabase
                .from('technician')
                .select('technician_id, name');
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
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('category')
                .select('category_id, lantai');
            console.log('Fetched Categories:', data);
            
            if (error || !data) {
                console.error('Error fetching categories: ', error);
                return;
            }
            if (data){
                setCategories(data);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchAdmin = async () => {
            const { data, error } = await supabase
                .from('admin')
                .select('admin_id, name');
            console.log('Fetched Admin:', data);
            
            if (error || !data) {
                console.error('Error fetching admin: ', error);
                return;
            }
            if (data){
                setAdmins(data);
            }
        }
        fetchAdmin();
    }, []);

    const toTimestampString = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const Y = date.getFullYear();
        const M = pad(date.getMonth() + 1);
        const D = pad(date.getDate());
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };

    const handleSubmit = form.handleSubmit(async (formData) => {
        setLoading(true);

        const payload = {
            title:        formData.title,
            description:  formData.description,
            technician_id: formData.technician_id,
            category_id:  formData.category_id,
            start_time: toTimestampString(formData.start_time),
            status:       'belum_mulai',
            created_at: toTimestampString(new Date()),
            admin_id:     formData.admin_id
        };
        console.log('Insert payload:', payload);
        const { data, error } = await supabase
            .from('workorder')
            .insert([payload])  
            .select()
        if (error) {
            console.error('Supabase insert error:', error);
        } else {
            if (data && data.length > 0) {
                onAddWorkOrder(data[0]);
            } else {
                console.error("Data tidak ditemukan setelah insert");
            }
            form.reset();
            onOpenChange(false);
        }
        setLoading(false);
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: "",
                description: "",
                technician_id: "",
                category_id: "",
                admin_id: "",
                start_time: new Date()
            });
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Work Order</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter title..." {...field} required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Start Time */}
                        <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Technician Select */}
                        <FormField
                            control={form.control}
                            name="technician_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign Technician</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Technician" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.technician_id} value={tech.technician_id}>
                                                    {tech.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Select */}
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {categories.map((cate) => (
                                                <SelectItem key={cate.category_id} value={cate.category_id}>
                                                    {cate.lantai}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Admin Select */}
                        <FormField
                            control={form.control}
                            name="admin_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Admin</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Admin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {admins.map((adm) => (
                                                <SelectItem key={adm.admin_id} value={adm.admin_id}>
                                                    {adm.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Work Order"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}