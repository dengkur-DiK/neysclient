 export default function About() {
  return (
    <section id="about" className="py-20 px-6 md:px-12" style={{ backgroundColor: 'var(--dark-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6">About AntBros</h2>
            <p className="text-xl text-gray-300 mb-6">
              AntBros is a newly established photography studio in the heart of Wanyjok Market. We're dedicated to capturing your most important moments with a fresh perspective and a personal touch.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              We specialize in creating authentic and vibrant visual stories for individuals and businesses in our community. Our passion is to help you tell your unique story through stunning, high-quality photography.
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--orange-accent)' }}>1st</div>
                <div className="text-gray-400">Location Opened</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--orange-accent)' }}>Local</div>
                <div className="text-gray-400">Community Focused</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--orange-accent)' }}>Fresh</div>
                <div className="text-gray-400">Creative Vision</div>
              </div>
            </div>
          </div>
          <div className="fade-in">
            <img
              src="https://images.unsplash.com/photo-1579782522721-e00f393962d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Creative team collaboration"
              className="rounded-xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}