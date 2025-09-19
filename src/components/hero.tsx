import { Button } from "@/components/ui/button";

export default function Hero() {
  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
      <img 
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
        alt="Modern creative workspace" 
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-bold font-['Poppins'] mb-6 leading-tight">
          Creative <span style={{ color: 'var(--orange-accent)' }}>Photography</span><br />
          <span className="text-3xl md:text-5xl font-light">for the Digital Age</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
          We capture innovation, technology, and human collaboration through stunning visual storytelling that elevates your brand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={scrollToPortfolio}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View Our Work
          </Button>
          <Button 
            onClick={scrollToBooking}
            variant="outline" 
            className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full font-semibold transition-all duration-300"
          >
            Book a Session
          </Button>
        </div>
      </div>
    </section>
  );
}
