import React from 'react';
import { Layout } from '../layout/Layout';
import { HeroSection } from '../layout/HeroSection';
import { FeaturedProducts } from '../layout/FeaturedProducts';
import { Categories } from '../layout/Categories';
import { Testimonials } from '../layout/Testimonials';
import { Newsletter } from '../layout/Newsletter';
import { Button } from '../../ui/Button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ECommerce() {
  return (
    <Layout>
      <HeroSection />
      <div className="container mx-auto my-8 flex justify-end">
        <Link to="/products">
          <Button className="flex items-center gap-2">
            View All Products <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      {/* <Categories /> */}
      <FeaturedProducts />
      {/* <Testimonials /> */}
      {/* <Newsletter /> */}
    </Layout>
  );
}