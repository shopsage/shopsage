import { useState } from 'react';
import { Search, TrendingDown, TrendingUp, ExternalLink, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrackingPageProps {
  onViewTracking: (id: string) => void;
}

interface TrackedProduct {
  id: string;
  name: string;
  image: string;
  currentPrice: string;
  originalPrice: string;
  priceChange: number;
  seller: string;
  platform: string;
  lastUpdated: string;
}

interface SavedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  seller: string;
  platform: string;
  savedDate: string;
}

const MOCK_ACTIVE_TRACKING: TrackedProduct[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',
    currentPrice: 'SGD $429.00',
    originalPrice: 'SGD $549.00',
    priceChange: -22,
    seller: 'TechStore Official',
    platform: 'Shopee',
    lastUpdated: '2 hours ago'
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (2nd Generation)',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop',
    currentPrice: 'SGD $349.00',
    originalPrice: 'SGD $329.00',
    priceChange: 6,
    seller: 'Apple Authorized Reseller',
    platform: 'Lazada',
    lastUpdated: '5 hours ago'
  },
  {
    id: '3',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    currentPrice: 'SGD $1,299.00',
    originalPrice: 'SGD $1,448.00',
    priceChange: -10,
    seller: 'Samsung Official Store',
    platform: 'Shopee',
    lastUpdated: '1 day ago'
  }
];

const MOCK_SAVED_PRODUCTS: SavedProduct[] = [
  {
    id: '4',
    name: 'Logitech MX Master 3S Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
    price: 'SGD $149.00',
    seller: 'Logitech Official Store',
    platform: 'Lazada',
    savedDate: '3 days ago'
  },
  {
    id: '5',
    name: 'Keychron K2 Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    price: 'SGD $129.00',
    seller: 'Keychron Official',
    platform: 'Shopee',
    savedDate: '1 week ago'
  },
  {
    id: '6',
    name: 'Dell UltraSharp 27" 4K Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    price: 'SGD $699.00',
    seller: 'Dell Official Store',
    platform: 'Lazada',
    savedDate: '2 weeks ago'
  }
];

export function TrackingPage({ onViewTracking }: TrackingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h2 className="text-2xl text-gray-900 mb-4">Product Tracking</h2>
          
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracked or saved products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Tracking</TabsTrigger>
            <TabsTrigger value="saved">Saved Products</TabsTrigger>
          </TabsList>

          {/* Active Tracking Tab */}
          <TabsContent value="active" className="space-y-4">
            {MOCK_ACTIVE_TRACKING.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2">{product.name}</h3>
                    
                    {/* Price Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xl text-blue-600">{product.currentPrice}</span>
                      <span className="text-gray-500 line-through">{product.originalPrice}</span>
                      <Badge 
                        variant={product.priceChange < 0 ? "default" : "destructive"}
                        className={product.priceChange < 0 ? "bg-green-600" : ""}
                      >
                        <div className="flex items-center gap-1">
                          {product.priceChange < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {Math.abs(product.priceChange)}%
                        </div>
                      </Badge>
                    </div>

                    {/* Seller and Platform Info */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>{product.seller}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">{product.platform}</Badge>
                      <span>•</span>
                      <span>Updated {product.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewTracking(product.id)}
                      className="gap-2"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Saved Products Tab */}
          <TabsContent value="saved" className="space-y-4">
            {MOCK_SAVED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2">{product.name}</h3>
                    
                    {/* Price Info */}
                    <div className="mb-2">
                      <span className="text-xl text-blue-600">{product.price}</span>
                    </div>

                    {/* Seller and Platform Info */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>{product.seller}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">{product.platform}</Badge>
                      <span>•</span>
                      <span>Saved {product.savedDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Track Price
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
