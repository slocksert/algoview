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
  selectedAlgorithm: 'bst' | 'avl' | 'b-tree' | 'fibonacci';
}

export default function TreeOperations({
  onExecuteOperation,
  isRunning,
  selectedAlgorithm,
}: TreeOperationsProps) {
  const [selectedOperation, setSelectedOperation] = useState<'insert' | 'delete' | 'search' | 'update' | 'balance'>('insert');
  const [inputValue, setInputValue] = useState<number | undefined>(undefined);
  const [newValue, setNewValue] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue === undefined && selectedOperation !== 'balance') {
      alert("Por favor, insira um valor válido.");
      return;
    }
    
    if (selectedOperation === 'update' && newValue === undefined) {
      alert("Por favor, insira um novo valor válido.");
      return;
    }
    
    const operation: AlgorithmOperation = {
      operation: selectedOperation,
      value: inputValue || 0,
      newValue: selectedOperation === 'update' ? newValue : undefined
    };
    
    onExecuteOperation(operation);
  };

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value as 'insert' | 'delete' | 'search' | 'update' | 'balance');
    // Reset values when changing operation
    if (value === 'balance') {
      setInputValue(undefined);
      setNewValue(undefined);
    }
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="update" id="update" />
              <Label htmlFor="update">Atualizar</Label>
            </div>
            {selectedAlgorithm === 'avl' && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance">Balancear</Label>
              </div>
            )}
          </RadioGroup>

          {selectedOperation !== 'balance' && (
            <div className="space-y-2">
              <Label htmlFor="value">
                {selectedOperation === 'insert' 
                  ? 'Valor para Inserir' 
                  : selectedOperation === 'delete'
                  ? 'Valor para Excluir'
                  : selectedOperation === 'search'
                  ? 'Valor para Buscar'
                  : 'Valor a ser Atualizado'}
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
          )}

          {selectedOperation === 'update' && (
            <div className="space-y-2">
              <Label htmlFor="newValue">Novo Valor</Label>
              <Input
                id="newValue"
                type="number"
                placeholder="Digite o novo valor"
                value={newValue === undefined ? '' : newValue}
                onChange={(e) => setNewValue(e.target.value ? Number(e.target.value) : undefined)}
                disabled={isRunning}
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isRunning || (selectedOperation !== 'balance' && inputValue === undefined) || (selectedOperation === 'update' && newValue === undefined)}
          >
            {isRunning ? 'Executando...' : 'Executar Operação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
