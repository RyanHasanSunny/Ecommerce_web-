import { Award, Shield, Truck, Headphones } from "lucide-react";

export default function ServiceSection() {
  const features = [
    {
      icon: Award,
      title: "High Quality",
      description: "Crafted from top materials"
    },
    {
      icon: Shield,
      title: "Warranty Protection",
      description: "Over 2 years"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Order over 150 ৳"
    },
    {
      icon: Headphones,
      title: "24 / 7 Support",
      description: "Dedicated support"
    }
  ];

  return (
    <div className="bg-white rounded-xl py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}