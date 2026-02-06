export default function SettingsPage() {
  return (
    <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[90px] pt-[80px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-800">Settings</h1>
        <p className="mt-1 text-sm font-light text-neutral-500">
          Manage your preferences
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="font-medium text-neutral-800">Notifications</h3>
          <p className="mt-1 text-sm font-light text-neutral-500">
            Configure how you receive price alerts
          </p>
        </div>
        
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="font-medium text-neutral-800">Account</h3>
          <p className="mt-1 text-sm font-light text-neutral-500">
            Manage your account settings
          </p>
        </div>
        
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="font-medium text-neutral-800">About</h3>
          <p className="mt-1 text-sm font-light text-neutral-500">
            ShopSage v1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}

