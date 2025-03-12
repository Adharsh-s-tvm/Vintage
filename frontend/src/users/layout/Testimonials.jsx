import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        content: "I've bought several jackets from this store and the quality is consistently outstanding. The Mountain Parka kept me warm during my hike in Colorado last winter.",
        author: {
            name: 'Emily Johnson',
            role: 'Outdoor Enthusiast',
            image: 'https://i.pravatar.cc/150?img=32',
        },
        rating: 5,
    },
    {
        id: 2,
        content: "The Vintage Leather Jacket is worth every penny! The craftsmanship is excellent and the leather is soft yet durable. I've received countless compliments.",
        author: {
            name: 'Michael Rodriguez',
            role: 'Fashion Blogger',
            image: 'https://i.pravatar.cc/150?img=69',
        },
        rating: 5,
    },
    {
        id: 3,
        content: "Customer service is exceptional. When my order had a sizing issue, they exchanged it quickly with no hassle. The denim jacket fits perfectly now!",
        author: {
            name: 'Sarah Williams',
            role: 'Verified Customer',
            image: 'https://i.pravatar.cc/150?img=47',
        },
        rating: 4,
    },
];

export function Testimonials() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-gray-600">
                        Don't just take our word for it — read from our satisfied customers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                        >
                            {/* Stars */}
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Testimonial content */}
                            <blockquote className="text-gray-700 mb-6">
                                "{testimonial.content}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center">
                                <img
                                    src={testimonial.author.image}
                                    alt={testimonial.author.name}
                                    className="h-12 w-12 rounded-full mr-4"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">{testimonial.author.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.author.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
