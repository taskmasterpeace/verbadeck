export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-3 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Created by</span>
          <a
            href="https://machinekinglabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Machine King Labs
          </a>
          <span>•</span>
          <span>Internal Tool for Presenting</span>
          <span>•</span>
          <span>Version 0.9 • 2025</span>
        </div>
      </div>
    </footer>
  );
}
