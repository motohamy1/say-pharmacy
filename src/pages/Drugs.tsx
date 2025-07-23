import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { useState } from "react";

const drugCategories = [
  "Diabetes Drugs",
  "Hypertension Drugs", 
  "Chest Drugs",
  "Renal Drugs",
  "Dermatology Drugs",
  "Cardiac Drugs"
];

const mockDrugs = [
  {
    id: 1,
    name: "Metformin 500mg",
    manufacturer: "PharmaCorp",
    type: "Tablets",
    category: "Diabetes Drugs",
    price: "25 EGP"
  },
  {
    id: 2,
    name: "Insulin Aspart 100IU/mL",
    manufacturer: "Novo Nordisk",
    type: "Injections", 
    category: "Diabetes Drugs",
    price: "180 EGP"
  },
  {
    id: 3,
    name: "Glimepiride 2mg",
    manufacturer: "Sanofi",
    type: "Tablets",
    category: "Diabetes Drugs", 
    price: "35 EGP"
  },
  {
    id: 4,
    name: "Empagliflozin 10mg",
    manufacturer: "Eli Lilly",
    type: "Tablets",
    category: "Diabetes Drugs",
    price: "120 EGP"
  }
];

export default function Drugs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Diabetes Drugs");

  const filteredDrugs = mockDrugs.filter(drug => 
    drug.category === selectedCategory &&
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Drugs</span>
          </div>
          <h1 className="text-3xl font-bold">Drugs / Categories</h1>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for categories"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              Sort By
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {drugCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Drug List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedCategory}</h2>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">Filters</Button>
              <Button variant="outline" size="sm">Sort By</Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for drugs"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDrugs.map((drug) => (
              <Card key={drug.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Manufactured by {drug.manufacturer}
                    </p>
                    <h3 className="text-lg font-semibold mb-2">{drug.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {drug.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{drug.price}</p>
                  </div>
                </div>
                
                <Button className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <Button variant="outline" size="sm">‹</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">4</Button>
            <Button variant="outline" size="sm">›</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}