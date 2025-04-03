import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import DataStructuresView from "@/components/DataStructuresView";
import HashingView from "@/components/HashingView";
import ListsView from "@/components/ListsView";
import BenchmarkingPanel from "@/components/BenchmarkingPanel";

export default function KnuthVisualizer() {
  const [activeTab, setActiveTab] = useState("data-structures");

  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Visualizador de Algoritmos</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="data-structures">Estruturas de Dados</TabsTrigger>
            <TabsTrigger value="hashing">Hashing</TabsTrigger>
            <TabsTrigger value="lists">Listas Ligadas</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          </TabsList>

          <TabsContent value="data-structures" className="space-y-4">
            <DataStructuresView />
          </TabsContent>

          <TabsContent value="hashing" className="space-y-4">
            <HashingView />
          </TabsContent>

          <TabsContent value="lists" className="space-y-4">
            <ListsView />
          </TabsContent>

          <TabsContent value="benchmarking" className="space-y-4">
            <BenchmarkingPanel />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
