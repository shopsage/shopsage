import { ArrowLeft, ExternalLink, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActiveTrackingPageProps {
  trackingId: string;
  onBack: () => void;
}

const PRICE_HISTORY = [
  { date: 'Jan 1', price: 549 },
  { date: 'Jan 8', price: 529 },
  { date: 'Jan 15', price: 519 },
  { date: 'Jan 22', price: 499 },
  { date: 'Jan 29', price: 479 },
  { date: 'Feb 5', price: 459 },
  { date: 'Feb 12', price: 429 }
];

const PRODUCT_LISTINGS = [
  {
    id: '1',
    seller: 'TechStore Official',
    price: 'SGD $429.00',
    platform: 'Shopee',
    rating: 4.8,
    stock: 'In Stock',
    shipping: 'Free Shipping'
  },
  {
    id: '2',
    seller: 'Electronics Hub SG',
    price: 'SGD $449.00',
    platform: 'Lazada',
    rating: 4.7,
    stock: 'In Stock',
    shipping: 'Free Shipping'
  },
  {
    id: '3',
    seller: 'Audio Experts',
    price: 'SGD $459.00',
    platform: 'Shopee',
    rating: 4.6,
    stock: 'Low Stock',
    shipping: '$5.00'
  },
  {
    id: '4',
    seller: 'Premium Tech Store',
    price: 'SGD $479.00',
    platform: 'Lazada',
    rating: 4.5,
    stock: 'In Stock',
    shipping: 'Free Shipping'
  }
];

export function ActiveTrackingPage({ trackingId, onBack }: ActiveTrackingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tracking
          </Button>
          
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop"
                alt="Sony WH-1000XM5"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl text-gray-900 mb-2">Sony WH-1000XM5 Wireless Noise-Cancelling Headphones</h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl text-blue-600">SGD $429.00</span>
                <Badge className="bg-green-600">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    22% off
                  </div>
                </Badge>
              </div>
              <p className="text-gray-600 mt-2">Tracking since January 1, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Price Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg text-gray-900 mb-4">Price History</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRICE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  domain={[400, 560]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`SGD $${value}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Listings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg text-gray-900 mb-4">Available Listings</h2>
          <div className="space-y-3">
            {PRODUCT_LISTINGS.map((listing) => (
              <div
                key={listing.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{listing.seller}</h3>
                      <Badge variant="outline" className="text-xs">{listing.platform}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Rating: {listing.rating}/5</span>
                      <span>•</span>
                      <span className={listing.stock === 'In Stock' ? 'text-green-600' : 'text-orange-600'}>
                        {listing.stock}
                      </span>
                      <span>•</span>
                      <span>{listing.shipping}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xl text-blue-600">{listing.price}</span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg text-gray-900 mb-4">Product Options & Reasoning</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              The Sony WH-1000XM5 is currently the best value option among premium noise-cancelling headphones in the Southeast Asian market.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Industry-leading noise cancellation technology</li>
              <li>30-hour battery life with quick charging</li>
              <li>Premium build quality and comfort for long listening sessions</li>
              <li>Multi-point connectivity for seamless device switching</li>
              <li>Excellent customer reviews across all major platforms</li>
            </ul>
            <p>
              Price has dropped 22% from original listing, making this an excellent time to purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
