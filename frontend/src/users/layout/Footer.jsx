import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/ecommerce" className="text-xl font-bold text-gray-900">
              VINT<span className="text-danger">AGE</span>
            </Link>
            <p className="mt-4 text-gray-600">
              Premium jacket collections for all seasons. Quality materials, timeless designs.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-500 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              {["Winter Collection", "Leather Jackets", "Denim Jackets", "Waterproof", "New Arrivals"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-primary">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {["About Us", "Contact Us", "FAQs", "Privacy Policy", "Terms & Conditions"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-primary">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <span className="text-gray-600">123 Fashion St, Design City, 94103</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">support@vintage.com</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">
                Subscribe to our newsletter
              </h4>
              <div className="mt-2 flex">
                <Input type="email" placeholder="Your email" className="flex-1 min-w-0" />
                <Button type="button" className="ml-2">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-500">
            &copy; {new Date().getFullYear()} JacketHub. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <img src="https://via.placeholder.com/40x25" alt="Visa" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="Mastercard" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="PayPal" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="ApplePay" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}

