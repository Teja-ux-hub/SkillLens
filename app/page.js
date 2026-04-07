"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { User, Star, Quote } from "lucide-react";

import HeroSection from "@/components/heroSection";
import Roadmap from "@/components/roadmap";
import { faqs } from "@/data/faqs";

const testimonials = [
  { name: "Amit Sharma", roll: "21CS001", rating: 5, quote: "This platform transformed my interview preparation completely!" },
  { name: "Priya Singh", roll: "21CS002", rating: 5, quote: "The AI feedback helped me identify my weak points instantly." },
  { name: "Rahul Verma", roll: "21CS003", rating: 5, quote: "Best technical interview practice I've ever experienced." },
  { name: "Sneha Patel", roll: "21CS004", rating: 5, quote: "Landed my dream job thanks to this amazing preparation tool." },
  { name: "Vikram Rao", roll: "21CS005", rating: 5, quote: "The real-time feedback feature is absolutely game-changing." },
  { name: "Meera Das", roll: "21CS006", rating: 5, quote: "Boosted my confidence tremendously for technical interviews." },
  { name: "Karthik Kumar", roll: "21CS007", rating: 5, quote: "The AI interviewer feels incredibly realistic and helpful." },
  { name: "Ananya Reddy", roll: "21CS008", rating: 5, quote: "Perfect practice platform for coding interviews." },
  { name: "Nitish Reddy", roll: "21CS009", rating: 5, quote: "Perfect practice platform for coding and development." },

];

function TestimonialsSection() {
  return (
    <div className="w-full py-20 relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900/50 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent)]"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-4">
            Success Stories
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of students who have transformed their interview skills
          </p>
        </div>
        
        {/* Infinite scroll container with invisible scrollbar */}
        <div className="relative overflow-hidden mask-fade">
          <div className="flex gap-6 animate-infinite-scroll">
            {/* Double the testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={idx}
                className="min-w-[320px] bg-black/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6 hover:shadow-white/10 transition-all duration-300 group hover:scale-105"
              >
                {/* Quote icon */}
                <Quote className="w-6 h-6 text-white/60 mb-4 group-hover:text-white transition-colors" />
                
                {/* Testimonial text */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 group-hover:text-white transition-colors">
                  {t.quote}
                </p>
                
                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-white fill-current" />
                  ))}
                </div>
                
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold group-hover:text-gray-300 transition-colors">{t.name}</div>
                    <div className="text-gray-400 text-sm">{t.roll}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-infinite-scroll {
          width: max-content;
          animation: infinite-scroll 30s linear infinite;
        }
        
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        
        .mask-fade {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const cardsRef = useRef(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Roadmap Section */}
      <div className="px-6 py-20">
        <Roadmap />
      </div>

      {/* Features Section */}
      <section className="px-6 py-20 relative rounded-3xl mx-6 mb-20">
        <div className="absolute inset-0 bg-gradient-to-b  from-black via-gray-900/30 to-black rounded-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Everything you need to ace your next technical interview
            </p>
          </div>
          
          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            {[
              {
                title: "Interview Mastery",
                desc: "Best realistic interview experience including DSA, system design, and behavioral questions with AI feedback.",
                icon: "🎯"
              },
              {
                title: "Industry Insights",
                desc: "Access real-time market trends, salary data, job requirements, and skill demand analytics.",
                icon: "📊"
              },
              {
                title: "Best Roadmap with Progress Tracking",
                desc: "Comprehensive learning paths with milestone tracking and personalized study schedules.",
                icon: "🗺️"
              },
              {
                title: "Resources & GitHub Analysis",
                desc: "Curated learning resources and automated GitHub profile analysis for portfolio improvement.",
                icon: "📚"
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="bg-black/50  border-white/50 backdrop-blur-sm border  rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-white/10 cursor-pointer group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gray-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed group-hover:text-white transition-colors">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Invisible Scrollbar */}
      <section className="px-6 py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.05),transparent)]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to know about our platform
            </p>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto scrollbar-none pr-4">
            <Accordion type="single" collapsible className="space-y-6">
              {faqs.slice(0, 5).map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-2 hover:border-white/20 transition-all duration-300"
                >
                  <AccordionTrigger className="text-lg font-medium text-white hover:text-gray-300 transition-colors py-6 hover:no-underline">
                    <span className="text-left">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-white leading-relaxed pb-6 pt-0">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      <style jsx global>{`
        /* Hide scrollbar for FAQ section */
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        
      `}</style>
    </div>
  );
}