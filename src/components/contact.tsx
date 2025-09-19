 // file: client/src/pages/contact.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// A simple, local version of apiRequest to handle the POST call.
const apiRequest = async (endpoint: string, data: any) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      // UPDATED: Now sends data to the new /api/messages endpoint
      // and omits the subject field to match your new schema.
      const messagePayload = {
        name: data.name,
        email: data.email,
        message: data.message,
      };
      const response = await apiRequest('/api/messages', messagePayload);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message! We'll get back to you soon.",
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear from you and discuss how we can bring your vision to life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="fade-in">
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <MapPin className="text-orange-500 w-5 h-5" />
                <div>
                  <div className="font-semibold">Studio Address</div>
                  <div className="text-gray-300">123 Studio Avenue, Wanyjok City 12345</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="text-orange-500 w-5 h-5" />
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-300">+211920342029</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="text-orange-500 w-5 h-5" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-300">antbrosphotography@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="text-orange-500 w-5 h-5" />
                <div>
                  <div className="font-semibold">Business Hours</div>
                  <div className="text-gray-300">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/antbros46/" className="text-orange-500 hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61571398028552" className="text-orange-500 hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://x.com/AntbrosP" className="text-orange-500 hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/antbros-photography-523659385/" className="text-orange-500 hover:text-orange-400 transition-colors" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="fade-in">
            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800 border-gray-600 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800 border-gray-600 focus:border-orange-500"
                    required
                  />
                </div>
              </div>
        
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-gray-800 border-gray-600 focus:border-orange-500"
                  rows={6}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 font-semibold"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}