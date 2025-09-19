export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t py-12 px-6 md:px-12" style={{ backgroundColor: 'var(--dark-primary)', borderColor: 'var(--dark-accent)' }}>
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-2xl font-bold font-['Poppins'] mb-4">
          AntBros<span style={{ color: 'var(--orange-accent)' }}>.</span>
        </div>
        <p className="text-gray-400 mb-6">Creative Photography Studio | Tech • Innovation • Collaboration</p>
        <div className="flex justify-center space-x-6 mb-6">
          <button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-white transition-colors">
            Home
          </button>
          <button onClick={() => scrollToSection('portfolio')} className="text-gray-400 hover:text-white transition-colors">
            Portfolio
          </button>
          <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors">
            About
          </button>
          <button onClick={() => scrollToSection('services')} className="text-gray-400 hover:text-white transition-colors">
            Services
          </button>
          <button onClick={() => scrollToSection('booking')} className="text-gray-400 hover:text-white transition-colors">
            Booking
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors">
            Contact
          </button>
          <a href="/admin" className="text-gray-400 hover:text-orange-400 transition-colors">
            Admin
          </a>
        </div>
        <div className="text-sm text-gray-500">
          © 2025 AntBros Photography Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
