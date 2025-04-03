import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlgorithmOperation } from "@/lib/definitions";

interface TreeOperationsProps {
  onExecuteOperation: (operation: AlgorithmOperation) => void;
  isRunning: boolean;
  selectedAlgorithm: 'bst' | 'avl';
}

export default function TreeOperations({
  onExecuteOperation,
  isRunning,
}: TreeOperationsProps) {
  const [selectedOperation, setSelectedOperation] = useState<'insert' | 'delete' | 'search' >('insert');
  const [inputValue, setInputValue] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const operation: AlgorithmOperation = {
      operation: selectedOperation,
      value: inputValue || 0,
      newValue: undefined
    };
    
    onExecuteOperation(operation);
  };

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value as 'insert' | 'delete' | 'search');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operações da Árvore</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup
            value={selectedOperation}
            onValueChange={handleOperationChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="insert" id="insert" />
              <Label htmlFor="insert">Inserir</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delete" id="delete" />
              <Label htmlFor="delete">Excluir</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="search" id="search" />
              <Label htmlFor="search">Buscar</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="value">
              {selectedOperation === 'insert' 
                ? 'Valor para Inserir' 
                : selectedOperation === 'delete'
                ? 'Valor para Excluir'
                : 'Valor para Buscar'}
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="Digite um valor"
              value={inputValue === undefined ? '' : inputValue}
              onChange={(e) => setInputValue(e.target.value ? Number(e.target.value) : undefined)}
              disabled={isRunning}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isRunning || inputValue === undefined}
          >
            {isRunning ? 'Executando...' : 'Executar Operação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
