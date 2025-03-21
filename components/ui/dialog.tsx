import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

export function Dialog({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="bg-white text-black px-6 py-3 rounded-lg border border-gray-300 shadow-md text-lg font-semibold absolute right-6 top-6"
            >
                + Add Event
            </button>
            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-black p-6 rounded-xl shadow-lg w-[400px]">
                        <button onClick={() => setOpen(false)} className="absolute top-3 left-3 text-white-500 text-5xl p-2 hover:text-red-500 transition duration-200">
                            ✖
                        </button>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}

export function DialogTitle({ children }: { children: ReactNode }) {
    return <h2 className="text-xl font-bold mb-2">{children}</h2>;
}

export function DialogContent({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
