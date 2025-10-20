 import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Local type (was imported from backend before)
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  image?: string;
}

export default function Portfolio() {
  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["portfolioItems"],
    queryFn: () => apiRequest("GET", "/api/portfolio").then(res => res.json()),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  if (isLoading) {
    return (
      <section id="portfolio" className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-4">Our Portfolio</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Loading our latest work...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-4">Our Portfolio</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Showcasing our expertise in tech photography, creative workspaces, and collaborative projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="portfolio-item rounded-xl overflow-hidden fade-in visible"
              style={{ backgroundColor: "var(--dark-secondary)" }}
            >
              {item.image && item.image.startsWith("http") ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/640x360/333/FFF?text=Image+Not+Found")}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-700 text-gray-400 text-center p-4">
                  No Image Provided or Invalid URL
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
                {item.category && <p className="text-sm mt-1 text-gray-400">Category: {item.category}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
