import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import { Editor } from "@/components/ui/editor";

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  startingCode: string;
  solutionCode: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
};

const challenges = [
  {
    id: "challenge-1",
    title: "Balanced Binary Search Tree",
    description: "Implement a function to check if a binary search tree is balanced",
    difficulty: "easy",
    category: "trees",
    startingCode: `function isBalanced(root) {
  // Your code here
  // A balanced tree has the heights of its left and right subtrees
  // differ by at most 1 for all nodes
}`,
    solutionCode: `function isBalanced(root) {
  // Base case: empty tree is balanced
  if (!root) return true;
  
  // Helper function to get height
  function getHeight(node) {
    if (!node) return 0;
    return 1 + Math.max(getHeight(node.left), getHeight(node.right));
  }
  
  // Check if current node is balanced
  const leftHeight = getHeight(root.left);
  const rightHeight = getHeight(root.right);
  const heightDiff = Math.abs(leftHeight - rightHeight);
  
  if (heightDiff > 1) return false;
  
  // Recursively check left and right subtrees
  return isBalanced(root.left) && isBalanced(root.right);
}`,
    testCases: [
      { input: "balanced tree", expectedOutput: "true" },
      { input: "unbalanced tree", expectedOutput: "false" }
    ]
  },
  {
    id: "challenge-2",
    title: "Self-Organizing List",
    description: "Implement a move-to-front self-organizing list",
    difficulty: "medium",
    category: "lists",
    startingCode: `class SelfOrganizingList {
  constructor() {
    this.items = [];
  }
  
  // Find an item in the list and move it to the front if found
  findAndMove(item) {
    // Your code here
  }
  
  add(item) {
    this.items.push(item);
  }
  
  getItems() {
    return [...this.items];
  }
}`,
    solutionCode: `class SelfOrganizingList {
  constructor() {
    this.items = [];
  }
  
  // Find an item in the list and move it to the front if found
  findAndMove(item) {
    const index = this.items.indexOf(item);
    
    if (index !== -1) {
      // Remove the item and add it to the front
      this.items.splice(index, 1);
      this.items.unshift(item);
      return true;
    }
    
    return false;
  }
  
  add(item) {
    this.items.push(item);
  }
  
  getItems() {
    return [...this.items];
  }
}`,
    testCases: [
      { input: "find 'A' in ['A', 'B', 'C']", expectedOutput: "[A, B, C] → [A, B, C]" },
      { input: "find 'B' in ['A', 'B', 'C']", expectedOutput: "[A, B, C] → [B, A, C]" }
    ]
  },
  {
    id: "challenge-3",
    title: "Universal Hashing",
    description: "Implement Knuth's multiplicative hashing method",
    difficulty: "hard",
    category: "hashing",
    startingCode: `function knuthMultiplicativeHash(key, tableSize) {
  // The famous constant A ≈ (sqrt(5) - 1) / 2 = 0.6180339887...
  // Your code here
}`,
    solutionCode: `function knuthMultiplicativeHash(key, tableSize) {
  // The famous constant A ≈ (sqrt(5) - 1) / 2 = 0.6180339887...
  const A = 0.6180339887;
  
  // Convert string key to number if needed
  let numKey = typeof key === 'string' 
    ? key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    : key;
  
  // Multiply by A and take fractional part
  const fractionalPart = (numKey * A) % 1;
  
  // Scale to table size
  return Math.floor(tableSize * fractionalPart);
}`,
    testCases: [
      { input: "hash(42, 10)", expectedOutput: "≈ 1" },
      { input: "hash(123, 10)", expectedOutput: "≈ 6" }
    ]
  }
];

const ChallengesPanel = () => {
  const [selectedTab, setSelectedTab] = useState("beginner");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const { toast } = useToast();

  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge.id);
    setUserCode(challenge.startingCode);
    setShowSolution(false);
  };

  const handleSubmitCode = () => {
    if (!userCode.trim()) {
      toast({
        title: "No Code Submitted",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    setProgress(0);
    
    // Simulate code evaluation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsSubmitting(false);
          
          toast({
            title: "Code Evaluated",
            description: "Your solution has been processed. Check the test results below.",
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleShowSolution = () => {
    const challenge = challenges.find(c => c.id === selectedChallenge);
    if (challenge) {
      setUserCode(challenge.solutionCode);
      setShowSolution(true);
      
      toast({
        title: "Solution Revealed",
        description: "Take time to understand the solution before moving on.",
      });
    }
  };

  const filterChallengesByLevel = (level: string) => {
    let difficultyFilter: string;
    
    switch (level) {
      case "beginner":
        difficultyFilter = "easy";
        break;
      case "intermediate":
        difficultyFilter = "medium";
        break;
      case "advanced":
        difficultyFilter = "hard";
        break;
      default:
        return challenges;
    }
    
    return challenges.filter(challenge => challenge.difficulty === difficultyFilter);
  };

  const renderDifficultyBadge = (difficulty: string) => {
    let color;
    switch (difficulty) {
      case "easy":
        color = "bg-green-100 text-green-800";
        break;
      case "medium":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "hard":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {difficulty.toUpperCase()}
      </span>
    );
  };

  const currentChallenge = challenges.find(c => c.id === selectedChallenge);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Knuth Algorithm Challenges</CardTitle>
          <CardDescription>
            Test your knowledge of data structures and algorithms with these challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="beginner" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterChallengesByLevel("beginner").map(challenge => (
                  <Card 
                    key={challenge.id}
                    className={`cursor-pointer transition-all ${selectedChallenge === challenge.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSelectChallenge(challenge)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        {renderDifficultyBadge(challenge.difficulty)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-500">{challenge.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Badge variant="outline">{challenge.category}</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="intermediate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterChallengesByLevel("intermediate").map(challenge => (
                  <Card 
                    key={challenge.id}
                    className={`cursor-pointer transition-all ${selectedChallenge === challenge.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSelectChallenge(challenge)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        {renderDifficultyBadge(challenge.difficulty)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-500">{challenge.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Badge variant="outline">{challenge.category}</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterChallengesByLevel("advanced").map(challenge => (
                  <Card 
                    key={challenge.id}
                    className={`cursor-pointer transition-all ${selectedChallenge === challenge.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
                    onClick={() => handleSelectChallenge(challenge)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        {renderDifficultyBadge(challenge.difficulty)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-500">{challenge.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Badge variant="outline">{challenge.category}</Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {selectedChallenge && currentChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentChallenge.title}</CardTitle>
                  <CardDescription>{currentChallenge.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {renderDifficultyBadge(currentChallenge.difficulty)}
                  <Badge variant="outline">{currentChallenge.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted">
                <div className="h-[400px]">
                  <Editor
                    value={userCode}
                    onChange={setUserCode}
                    highlightActiveLine={true}
                    fontSize={14}
                    showPrintMargin={false}
                    mode="javascript"
                    theme="github"
                    editorProps={{ $blockScrolling: true }}
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitCode} 
                  disabled={isSubmitting || showSolution}
                >
                  {isSubmitting ? "Evaluating..." : "Submit"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShowSolution}
                  disabled={showSolution}
                >
                  Show Solution
                </Button>
              </div>
              
              {isSubmitting && (
                <div className="w-1/3">
                  <Progress value={progress} />
                </div>
              )}
            </CardFooter>
          </Card>
          
          {(progress === 100 || showSolution) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentChallenge.testCases.map((testCase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">Test Case {index + 1}</div>
                        <div className="text-sm text-gray-500">Input: {testCase.input}</div>
                        <div className="text-sm text-gray-500">Expected: {testCase.expectedOutput}</div>
                      </div>
                      <div>
                        {showSolution ? (
                          <Badge className="bg-green-100 text-green-800">PASSED</Badge>
                        ) : (
                          <Badge className={Math.random() > 0.5 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {Math.random() > 0.5 ? "PASSED" : "FAILED"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengesPanel;
