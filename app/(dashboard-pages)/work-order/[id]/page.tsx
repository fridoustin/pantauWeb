'use client'

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { User, MapPin, ArrowLeft, Calendar, Clock, FileText, Clock3, AlertTriangle, CheckCircle, Image as ImageIcon } from 'lucide-react';

type StatusValue =
  | "Belum Mulai"
  | "Dalam Pengerjaan"
  | "Terkendala"
  | "Selesai"
  | string;

// Define TypeScript interfaces
interface WorkOrder {
  id: string;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string | null;
  status: string | null;
  technician_id: string | null;
  admin_id: string | null;
  category_id: string | null;
  before_url: string | null
  after_url: string | null
}

interface Technician {
  technician_id: string;
  name: string;
}

interface Category {
  category_id: string;
  lantai: string;
}

interface Props { params: Promise<{ id: string }> }

const supabase = createClient();

function StatusBadge({ status }: { status: string }) {
  const mapping: Record<
    string,
    { label: string; color: string }
  > = {
    belum_mulai: {
      label: "Belum Mulai",
      color: "bg-gray-100 text-gray-800",
    },
    dalam_pengerjaan: {
      label: "Dalam Pengerjaan",
      color: "bg-yellow-100 text-yellow-800",
    },
    selesai: {
      label: "Selesai",
      color: "bg-green-100 text-green-800",
    },
    terkendala: {
      label: "Terkendala",
      color: "bg-red-100 text-red-800",
    },
  };

  const { label, color } = mapping[status] ?? {
    label: "Tidak Diketahui",
    color: "bg-gray-200 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}
    >
      {label}
    </span>
  );
}


// Tab dengan ikon di bawah
interface StatusTabProps {
  name: StatusValue;
  isActive?: boolean;
  onClick?: () => void;
}

function StatusTab({ name, isActive, onClick }: StatusTabProps) {
  let Icon = Clock;
  switch (name) {
    case "Belum Mulai":
      Icon = Clock;
      break;
    case "Dalam Pengerjaan":
      Icon = Clock3;
      break;
    case "Terkendala":
      Icon = AlertTriangle;
      break;
    case "Selesai":
      Icon = CheckCircle;
      break;
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-2 rounded-md transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{name}</span>
    </button>
  );
}

export default function WorkOrderDetailsPage({ params }: Props) {
  const { id } = use(params);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [beforeIsPortrait, setBeforeIsPortrait] = useState(false);
  const [afterIsPortrait,  setAfterIsPortrait]  = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchWorkOrder() {
      try {
        setLoading(true);
        const { data: wo, error: woErr } = await supabase
          .from('workorder')
          .select('*')
          .eq('id', id)
          .single();
        if (woErr) throw woErr;
        if (!wo) throw new Error('Work order not found');
        if (!isMounted) return;
        setWorkOrder(wo);
        setBeforeImage(wo.before_url)
        setAfterImage(wo.after_url)

        // fetch technician
        if (wo.technician_id) {
          const { data: tech, error: techErr } = await supabase
            .from('technician')
            .select('technician_id, name')
            .eq('technician_id', wo.technician_id)
            .single();
          if (!techErr && tech) setTechnician(tech);
        }

        // fetch category
        if (wo.category_id) {
          const { data: cat, error: catErr } = await supabase
            .from('category')
            .select('category_id, lantai')
            .eq('category_id', wo.category_id)
            .single();
          if (!catErr && cat) setCategory(cat);
        }
        
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchWorkOrder();
    return () => {
        isMounted = false
    };
  }, [id]);

  // Calculate duration between start and end times
  const calculateDuration = (): string => {
    if (!workOrder?.start_time || !workOrder?.updated_at) return 'Not completed';
    const start = new Date(workOrder.start_time);
    const end = new Date(workOrder.updated_at);
    const diff = end.getTime() - start.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`;
  };

    const formatDate = (d?: string | null) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
    );

    if (error) return (
        <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md">
            <h2 className="text-lg text-red-800 font-medium">Error</h2>
            <p className="text-red-700">{error}</p>
            <Link href="/work-order" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Work Orders
            </Link>
        </div>
        </div>
    );


    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/work-order" className="inline-flex items-center text-blue-600 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Work Orders
                </Link>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Work Order Title Section */}
                <div className="bg-white p-4 flex justify-between items-center border-b">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">
                        {workOrder?.title}
                        </h2>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                        {/* Ubah: tampilkan nama teknisi */}
                        <User className="w-4 h-4 mr-1" />
                        {technician?.name || '-'}
                        <span className="mx-2">•</span>
                        {/* Ubah: tampilkan nama kategori */}
                        <MapPin className="w-4 h-4 mr-1" />
                        {category?.lantai || '-'}
                        </div>
                    </div>
                    <StatusBadge status={workOrder?.status || "Waiting"} />
                </div>

                
                {/* Main content */}
                <div className="p-6">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium flex items-center mb-2">
                            <FileText className="w-5 h-5 mr-2 text-gray-500" /> Description
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                            {workOrder?.description || 'No description provided'}
                        </div>
                    </div>
                    
                    {/* Schedule and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-lg font-medium flex items-center mb-2">
                                <Calendar className="w-5 h-5 mr-2 text-gray-500" /> Schedule
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Start Date</div>
                                        <div>{formatDate(workOrder?.start_time)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">End Date</div>
                                        <div>{formatDate(workOrder?.updated_at)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium flex items-center mb-2">
                                <Clock className="w-5 h-5 mr-2 text-gray-500" /> Duration
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {calculateDuration()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Images */}
                    <section>
                    <h3 className="text-lg font-medium flex items-center mb-2">
                        <ImageIcon className="w-5 h-5 mr-2 text-gray-500" /> Report Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Before */}
                        <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Before</div>
                        <div className="relative overflow-hidden aspect-video bg-gray-100 rounded-md">
                            {beforeImage ? (
                            <img
                                src={beforeImage}
                                alt="Before"
                                onLoad={(e) => {
                                const img = e.currentTarget;
                                setBeforeIsPortrait(img.naturalWidth < img.naturalHeight);
                                }}
                                className={`
                                absolute inset-0 w-full h-full
                                ${beforeIsPortrait ? 'object-contain' : 'object-cover'}
                                `}
                            />
                            ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="text-gray-400">No before image</span>
                            </div>
                            )}
                        </div>
                        </div>

                        {/* After */}
                        <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">After</div>
                        <div className="relative overflow-hidden aspect-video bg-gray-100 rounded-md">
                            {afterImage ? (
                            <img
                                src={afterImage}
                                alt="After"
                                onLoad={(e) => {
                                const img = e.currentTarget;
                                setAfterIsPortrait(img.naturalWidth < img.naturalHeight);
                                }}
                                className={`
                                absolute inset-0 w-full h-full
                                ${afterIsPortrait ? 'object-contain' : 'object-cover'}
                                `}
                            />
                            ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="text-gray-400">No after image</span>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                    </section>
                    
                    {/* Additional Information */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Created At</div>
                                    <div>{formatDate(workOrder?.created_at)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Last Updated</div>
                                    <div>{formatDate(workOrder?.updated_at)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Admin ID</div>
                                    <div className="truncate">{workOrder?.admin_id || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}