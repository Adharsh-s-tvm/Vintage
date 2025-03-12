import React from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export function Newsletter() {
    return (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Join Our Newsletter</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Subscribe to our newsletter for updates on new collections, exclusive offers, and styling tips.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 max-w-md"
                        />
                        <Button type="button">
                            Subscribe
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </section>
    );
}
