import { useState } from 'react';
import { ExternalLink, Heart, TrendingUp, BadgeCheck, Star, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  seller: string;
  trusted: boolean;
  discount?: string;
  platform: string;
  rating?: number;
}

interface ProductResponseCardProps {
  product: Product;
}

export function ProductResponseCard({ product }: ProductResponseCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="md:flex">
        {/* Product Image */}
        <div className="md:w-64 flex-shrink-0">
          <div className="relative h-64 md:h-full bg-gray-100">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-red-500 text-white border-0 px-3 py-1">
                  {product.discount}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-1">
              <h3 className="text-lg text-gray-900 mb-3">{product.name}</h3>
              
              {/* Price and Rating */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl text-blue-600">{product.price}</span>
                {product.rating && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  {product.trusted && <BadgeCheck className="w-4 h-4 text-blue-600" />}
                  <span className="text-gray-700">{product.seller}</span>
                </div>
                <Badge variant="outline" className="text-xs">{product.platform}</Badge>
              </div>

              {/* Key Points */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Trusted seller with verified reviews</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Fast delivery across Southeast Asia</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="default"
                className="gap-2"
                onClick={() => window.open('#', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Go to Listing
              </Button>
              
              <Button 
                variant={isSaved ? "default" : "outline"}
                className="gap-2"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Add to Saved Products'}
              </Button>
              
              <Button 
                variant={isTracking ? "default" : "outline"}
                className="gap-2"
                onClick={() => setIsTracking(!isTracking)}
              >
                <TrendingUp className="w-4 h-4" />
                {isTracking ? 'Tracking' : 'Add to Active Tracking'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
