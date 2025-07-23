import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";

const personalCareCategories = [
  {
    name: "Skincare",
    description: "Face and body skincare products",
    color: "bg-blue-100"
  },
  {
    name: "Bath & Body", 
    description: "Cleansing and body care essentials",
    color: "bg-amber-100"
  },
  {
    name: "Feminine Care",
    description: "Women's health and hygiene products", 
    color: "bg-pink-100"
  },
  {
    name: "Oral Care",
    description: "Dental hygiene and mouth care",
    color: "bg-green-100"
  },
  {
    name: "Haircare",
    description: "Shampoos, treatments and styling",
    color: "bg-orange-100"
  },
  {
    name: "Men's Care", 
    description: "Grooming and personal care for men",
    color: "bg-gray-100"
  },
  {
    name: "Mother & Baby Care",
    description: "Products for mothers and infants",
    color: "bg-yellow-100"
  }
];

export default function PersonalCare() {
  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Personal Care</h1>
          <p className="text-muted-foreground">
            Comprehensive personal care and wellness products for your daily needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalCareCategories.map((category) => (
            <Card 
              key={category.name} 
              className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-4">
                <div className={`w-16 h-16 ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}