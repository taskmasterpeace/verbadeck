import { Outlet } from 'react-router-dom';

export function CreatePage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Outlet />
    </div>
  );
}
