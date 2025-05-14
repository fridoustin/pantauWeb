import Navbar from "@/components/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex flex-col">
    <div className="flex-1 flex items-center justify-center overflow-hidden">
      {children}
    </div>
  </div>
  );
}
