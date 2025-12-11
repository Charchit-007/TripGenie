import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight} from "lucide-react";
import view from './assets/view.jpg';


export default function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const places = [
    {
      name: "Paris",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
      description: "Experience the romance of the City of Light. From the iconic Eiffel Tower to charming cafés along the Seine, Paris offers timeless beauty and world-class art.",
      color: "from-blue-300 to-purple-200"
    },
    {
      name: "Tokyo",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
      description: "Discover where ancient tradition meets cutting-edge innovation. Tokyo blends serene temples with neon-lit streets, offering an unforgettable urban adventure.",
      color: "from-pink-300 to-red-200"
    },
    {
      name: "Santorini",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop",
      description: "Witness breathtaking sunsets over whitewashed villages. This Greek island paradise offers crystal-clear waters, stunning views, and unforgettable Mediterranean charm.",
      color: "from-blue-400 to-cyan-200"
    },
    {
      name: "New York",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
      description: "Explore the city that never sleeps. From Broadway shows to Central Park, NYC delivers endless energy, diverse culture, and iconic landmarks at every corner.",
      color: "from-yellow-300 to-orange-200"
    }
  ];

   const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % places.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + places.length) % places.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
    <html>
    <div className="min-h-screen bg-white text-gray-900 scroll-smooth">
      
      {/* Header */}
      <header className="w-full z-40 border-gray-100 absolute top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-serif font-bold text-gray-900">
              TripGenie
            </span>
          </div>

          {/* Desktop Navigation - FIXED & FLOATING */}
          <nav
            className="hidden md:flex items-center gap-10 
                      fixed top-6 left-1/2 -translate-x-1/2 z-50
                      px-8 py-4.5 
                      rounded-full
                      bg-white/30 
                      backdrop-blur-md 
                      border border-white/20 
                      shadow-xl transition-all duration-300"
          >
            <a href="#features" className="text-sm font-bold text-gray-800 hover:text-black transition cursor-pointer">
              Features
            </a>
            <a href="#benefits" className="text-sm font-bold text-gray-800 hover:text-black transition cursor-pointer">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-bold text-gray-800 hover:text-black transition cursor-pointer">
              Pricing
            </a>
            <a href="#contact" className="text-sm font-bold text-gray-800 hover:text-black transition cursor-pointer">
              Contact
            </a>
          </nav>

          <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded transition">
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white relative z-50">
            <nav className="flex flex-col px-4 py-4 gap-4">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#benefits" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                Benefits
              </a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="mt-12 md:mt-20 pt-20 pb-16 md:pt-12 md:pb-4 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 px-4">
      {/* Carousel */}
      <div className="relative flex items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 w-24 h-48 bg-green-200 rounded-2xl opacity-60" />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 w-24 h-48 bg-green-200 rounded-2xl opacity-60" />
        
        {/* Main carousel container */}
        <div className="relative w-full max-w-lg">
          <div className={`relative bg-linear-to-b ${places[currentIndex].color} rounded-3xl shadow-2xl overflow-hidden aspect-video`}>
            {/* Image */}
            <img 
              src={places[currentIndex].image} 
              alt={places[currentIndex].name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with place name */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">
              <h3 className="text-white text-3xl font-bold">{places[currentIndex].name}</h3>
            </div>
          </div>

          {/* Navigation buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {places.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-green-700 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content that changes with carousel */}
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {places[currentIndex].name}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          {places[currentIndex].description}
        </p>
        <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded transition text-lg font-medium">
          Explore {places[currentIndex].name}
        </button>
      </div>
    </div>
      </section>

      {/* Cracked Code Section (FEATURES) */}
      <section 
        id="features" 
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-1"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            We've cracked the code.
          </h2>
          <p className="text-gray-600 mb-16 text-lg max-w-2xl">
            Our innovative approach combines cutting-edge technology with proven methodologies to deliver exceptional results.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-lg border border-gray-100 hover:border-green-200 transition"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-green-700 font-bold text-xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Feature {i}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Unlock powerful capabilities designed to streamline your workflow and maximize productivity.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Image Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <img
            src={view}
            alt="Scenic landscape"
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* See the Big Picture (BENEFITS) */}
      <section 
        id="benefits" 
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                See the Big Picture
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Gain comprehensive insights into your business metrics and performance indicators. Our advanced analytics platform provides real-time data visualization and actionable intelligence.
              </p>
              <ul className="space-y-4 mb-8">
                {["Real-time Analytics", "Custom Dashboards", "Data Export"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <span className="text-green-700 font-bold">✓</span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded transition text-lg font-medium">
                Explore More
              </button>
            </div>

            <div className="bg-yellow-50 rounded-2xl h-96 flex items-center justify-center text-gray-400">
              <span className="text-6xl">■</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Area (PRICING/COMPARISON) */}
      <section 
        id="pricing" 
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Why Choose TripGenie?
          </h2>
          <p className="text-gray-600 mb-16 text-lg max-w-2xl">
            Discover the advantages that set us apart from the competition.
          </p>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-green-700">
                    TripGenie
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-400">
                    Competitor A
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-400">
                    Competitor B
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Advanced Analytics",
                  "Real-time Sync",
                  "24/7 Support",
                  "API Access",
                  "Custom Integrations",
                ].map((feature) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {feature}
                    </td>
                    <td className="py-4 px-6 text-center text-green-700 font-bold">
                      ✓
                    </td>
                    <td className="py-4 px-6 text-center text-gray-300">○</td>
                    <td className="py-4 px-6 text-center text-gray-300">○</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Map Your Success */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Map Your Success
          </h2>
          <p className="text-gray-600 mb-16 text-lg">
            Follow our proven methodology to achieve your goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { number: "01", title: "Plan", desc: "Define your strategy and goals" },
              {
                number: "02",
                title: "Execute",
                desc: "Implement with precision and care",
              },
              {
                number: "03",
                title: "Succeed",
                desc: "Achieve outstanding results",
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-6xl font-serif font-bold text-green-700 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="w-full h-80 bg-linear-to-r from-green-600 to-green-800 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-white text-center">
            <p className="text-xl font-serif">Your Success Story Starts Here</p>
          </div>
        </div>
      </section>

      {/* CTA Section (CONTACT) */}
      <section 
        id="contact" 
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-32"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Connect with us
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            Ready to transform your business? Get in touch with our team today.
          </p>
          <button className="bg-green-700 hover:bg-green-800 text-white px-10 py-4 rounded text-lg font-semibold transition">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">TripGenie</h3>
              <p className="text-sm">
                Transforming how businesses succeed online.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">
              © 2025 TripGenie. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-white transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </html>
    </>
  );
}