import { Camera, Laptop, Users, Building, Video, Edit } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <Camera className="w-10 h-10" />,
      title: "Studio Photography",
      description: "Professional studio sessions with state-of-the-art equipment and controlled lighting.",
      price: "Starting at 3000 SSP"
    },
    {
      icon: <Laptop className="w-10 h-10" />,
      title: "Tech Photography",
      description: "Specialized photography for technology products, startups, and innovation showcases.",
      price: "Starting at 55000 SSP"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Team Photography",
      description: "Collaborative team sessions capturing dynamic interactions and professional portraits. At any location.",
      price: "Starting at 100000 SSP"
    },
    {
      icon: <Building className="w-10 h-10" />,
      title: "Corporate Events",
      description: "Professional event coverage for conferences, product launches, and corporate gatherings.",
      price: "Starting at 500000 SSP"
    },
    {
      icon: <Video className="w-10 h-10" />,
      title: "Video Production",
      description: "High-quality video content creation for marketing, training, and promotional purposes.",
      price: "Starting at 35000000 SSP"
    },
    {
      icon: <Edit className="w-10 h-10" />,
      title: "Post-Production",
      description: "Professional editing, retouching, and color grading for all photography projects.",
      price: "Starting at 2000 SSP"
    }
  ];

  return (
    <section id="services" className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-4">Our Services</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional photography services tailored for the modern digital world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="service-card border-2 rounded-xl p-8 text-center fade-in" style={{ backgroundColor: 'var(--dark-secondary)', borderColor: 'var(--dark-accent)' }}>
              <div className="mb-4" style={{ color: 'var(--orange-accent)' }}>
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-gray-300 mb-6">{service.description}</p>
              <div className="font-semibold" style={{ color: 'var(--orange-accent)' }}>{service.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
