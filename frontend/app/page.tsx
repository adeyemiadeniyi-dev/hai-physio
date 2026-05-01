import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hai-Physio
          </h1>
          <p className="text-gray-600">
            AI-Powered Home Physiotherapy
          </p>
          <div className="mt-4 text-5xl">🏥</div>
        </div>

        {/* Role Selection Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Who are you?
          </h2>

          <div className="space-y-4">
            {/* Patient Button */}
            <Link href="/patient">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🧑‍⚕️</span>
                  <div className="text-left">
                    <div className="text-xl">I am a Patient</div>
                    <div className="text-sm opacity-90 font-normal">
                      Do my exercises
                    </div>
                  </div>
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </Link>

            {/* Clinician Button */}
            <Link href="/clinician">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">👨‍⚕️</span>
                  <div className="text-left">
                    <div className="text-xl">I am a Clinician</div>
                    <div className="text-sm opacity-90 font-normal">
                      Monitor patients
                    </div>
                  </div>
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>AI voice coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Remote monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>IBM Bob Dev Day Hackathon 2026</p>
          <p className="mt-1">Powered by IBM watsonx.ai</p>
        </div>
      </div>
    </main>
  );
}
