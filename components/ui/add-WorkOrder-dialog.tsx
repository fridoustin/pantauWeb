"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
    const form = useForm({
        defaultValues: {
            title: "",
            description: "",
            technician: "",
            category: "",
            status: "Waiting",
        },
    });

    const handleSubmit = form.handleSubmit((data) => {
        onAddWorkOrder({
            ...data,
            id: Date.now(),
            createdAt: now.toLocaleString(),
        });
        form.reset();
        onOpenChange(false);
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: "",
                description: "",
                technician: "",
                category: "",
                status: "Waiting",
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

                        {/* Technician Select */}
                        <FormField
                            control={form.control}
                            name="technician"
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
                                            <SelectItem value="Technician 1">Technician 1</SelectItem>
                                            <SelectItem value="Technician 2">Technician 2</SelectItem>
                                            <SelectItem value="Technician 3">Technician 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Select */}
                        <FormField
                            control={form.control}
                            name="category"
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
                                            <SelectItem value="Basement">Basement</SelectItem>
                                            <SelectItem value="Ground Floor">GF</SelectItem>
                                            <SelectItem value="Lt. 1">Lt. 1</SelectItem>
                                            <SelectItem value="Lt. 2">Lt. 2</SelectItem>
                                            <SelectItem value="Lt. 3">Lt. 3</SelectItem>
                                            <SelectItem value="Rooftop">Rooftop</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                Save Work Order
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
