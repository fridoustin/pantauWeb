import { createClient } from "@/utils/supabase/server";
import HeaderAuth from "./header-auth";

export default async function Navbar(){
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user ? (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                <div>Pantau Web</div>
                </div>
                <HeaderAuth />
            </div>
        </nav>
    ) : (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                <div>Pantau Web</div>
                </div>
            </div>
        </nav>
    );
}