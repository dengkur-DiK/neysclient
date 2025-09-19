import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar fixed top-0 w-full z-50 py-4 px-6 md:px-12 ${isScrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold font-['Poppins']">
          AntBros<span style={{ color: 'var(--orange-accent)' }}>.</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <button onClick={() => scrollToSection('home')} className="hover:text-orange-400 transition-colors">
            Home
          </button>
          <button onClick={() => scrollToSection('portfolio')} className="hover:text-orange-400 transition-colors">
            Portfolio
          </button>
          <button onClick={() => scrollToSection('about')} className="hover:text-orange-400 transition-colors">
            About
          </button>
          <button onClick={() => scrollToSection('services')} className="hover:text-orange-400 transition-colors">
            Services
          </button>
          <button onClick={() => scrollToSection('booking')} className="hover:text-orange-400 transition-colors">
            Booking
          </button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-orange-400 transition-colors">
            Contact
          </button>
        </div>
        
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black bg-opacity-95 backdrop-blur-md">
          <div className="flex flex-col space-y-4 p-6">
            <button onClick={() => scrollToSection('home')} className="text-left hover:text-orange-400 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('portfolio')} className="text-left hover:text-orange-400 transition-colors">
              Portfolio
            </button>
            <button onClick={() => scrollToSection('about')} className="text-left hover:text-orange-400 transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('services')} className="text-left hover:text-orange-400 transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('booking')} className="text-left hover:text-orange-400 transition-colors">
              Booking
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-left hover:text-orange-400 transition-colors">
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
