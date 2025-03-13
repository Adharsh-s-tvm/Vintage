import React from 'react';
import { Button } from '../../ui/Button';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-blue overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-28 lg:max-w-2xl lg:w-full">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Winter Collection</span>
                <span className="block text-primary">2025</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl">
                Discover our premium selection of jackets designed for style, comfort, and durability. From winter warmth to lightweight summer options.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex">
                <div className="rounded-md shadow">
                  <Button className="w-full md:w-auto text-lg">
                    <Link to="/products">Shop Now</Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                 
                </div>
              </div>
              <div className="mt-6 bg-white/30 backdrop-blur-md rounded-lg p-4 inline-block">
                <p className="text-sm font-medium text-gray-900">Limited Time Offer</p>
                <p className="text-base text-gray-700">Get 20% off on all winter jackets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80"
          alt="Modern jackets collection"
        />
      </div>
    </section>
  );
}
