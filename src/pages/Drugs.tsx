import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Database } from "lucide-react";
import { useEffect, useState } from "react";


export default function Drugs() {
  const [searchTerm, setSearchTerm] = useState("");
  // const [drugs, setDrugs] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [databaseStatus, setDatabaseStatus] = useState(null);
  // const [refreshing, setRefreshing] = useState(false);



  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Egyptian Drug Database
          </h1>
          <p className="text-gray-600">
            Search and browse medications from the Egyptian Drug Authority (EDA)
          </p>
          
          
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Database Status: drugs loaded
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-1  'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform 
                                -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by trade name, generic name, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>


          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 
                            border-blue-600"></div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          </div>
        


          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No drugs found matching your search.' : 'No drugs available.'}
            </p>
          </div>
      </div>
    </Layout>
  );
}