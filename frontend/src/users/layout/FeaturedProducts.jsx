import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '../../ui/Button';

const featuredProducts = [
  {
    id: 1,
    name: 'Mountain Parka',
    description: 'Waterproof winter parka with faux fur hood',
    price: 199.99,
    rating: 4.8,
    reviews: 120,
    imageSrc: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    colors: ['Black', 'Navy', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL'],
    href: '#',
  },
  {
    id: 2,
    name: 'Vintage Leather Jacket',
    description: 'Classic distressed leather biker jacket',
    price: 299.99,
    rating: 4.5,
    reviews: 84,
    imageSrc: 'https://images.unsplash.com/photo-1509957228579-c67a49ee30e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    colors: ['Brown', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    href: '#',
  },
  {
    id: 3,
    name: 'Quilted Puffer Jacket',
    description: 'Lightweight yet warm puffer with diamond quilting',
    price: 149.99,
    rating: 4.6,
    reviews: 98,
    imageSrc: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80',
    colors: ['Red', 'Blue', 'Black', 'Silver'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    href: '#',
  },
  {
    id: 4,
    name: 'Denim Trucker Jacket',
    description: 'Classic denim jacket with buttoned flap chest pockets',
    price: 89.99,
    rating: 4.7,
    reviews: 152,
    imageSrc: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1287&q=80',
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    href: '#',
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 max-w-3xl mx-auto text-gray-600">Our most popular selections, handpicked for quality and style</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover-lift transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <Link to={product.href} className="block overflow-hidden">
                  <img
                    src={product.imageSrc}
                    alt={product.name}
                    className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-rose-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-white">
                    <ShoppingBag className="h-4 w-4" />
                    Quick Add
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <Link to={product.href} className="block">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <span key={size} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">{size}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild className="px-8">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
