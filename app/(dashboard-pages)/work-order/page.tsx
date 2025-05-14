import WorkOrderList from "./WOList";

export default async function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <WorkOrderList />
    </div>
  );
}