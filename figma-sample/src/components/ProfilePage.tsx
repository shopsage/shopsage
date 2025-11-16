import { User } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2">Profile & Settings</h2>
          <p className="text-gray-600">
            This section is currently under development. Check back soon for user preferences, notification settings, and account management.
          </p>
        </div>
      </div>
    </div>
  );
}
