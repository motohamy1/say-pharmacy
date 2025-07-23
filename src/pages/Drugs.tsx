import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Drugs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrugs = async () => {
      setLoading(true);
      let query = supabase.from("drugs").select("*");
      if (searchTerm) {
        query = query.ilike("Drugname", `%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.error(error);
        setDrugs([]);
      } else {
        setDrugs(data);
      }
      setLoading(false);
    };
    fetchDrugs();
  }, [searchTerm]);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Drugs</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Drug Search</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a drug by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : drugs.length === 0 ? (
            <div className="text-center text-muted-foreground">No drugs found. Try a different search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drugs.map((drug) => (
                <Card key={drug.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold mb-1">{drug.Drugname}</h3>
                    <div className="text-sm text-muted-foreground mb-1">Form: {drug.Form || "-"}</div>
                    <div className="text-sm text-muted-foreground mb-1">Category: {drug.Category || "-"}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{drug.price}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}