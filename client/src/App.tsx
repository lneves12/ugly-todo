
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateTodoInput>({
    title: '',
    description: ''
  });

  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await trpc.createTodo.mutate(formData);
      setTodos((prev: Todo[]) => [...prev, response]);
      setFormData({
        title: '',
        description: ''
      });
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await trpc.deleteTodo.mutate({ id });
      setTodos((prev: Todo[]) => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with flashing text and animated GIF */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold blood-drip flashing dripping mb-4">
            🩸 DEATH LIST 🩸
          </h1>
          <div className="mb-4">
            <img 
              src="https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif" 
              alt="Scary skull GIF"
              className="mx-auto w-32 h-32 pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <p className="text-2xl creepy-text flashing">
            ⚰️ Your Tasks Await Their Doom ⚰️
          </p>
        </div>

        {/* Form Section */}
        <div className="retro-border p-6 mb-8 bg-black bg-opacity-80">
          <h2 className="text-3xl blood-drip mb-6 text-center">
            🔥 ADD NEW CURSED TASK 🔥
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xl creepy-text mb-2">
                💀 TASK TITLE OF DOOM:
              </label>
              <Input
                placeholder="Enter your cursed task title..."
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateTodoInput) => ({ ...prev, title: e.target.value }))
                }
                className="retro-input text-lg p-4"
                required
              />
            </div>

            <div>
              <label className="block text-xl creepy-text mb-2">
                🗡️ DESCRIPTION OF TERROR:
              </label>
              <Textarea
                placeholder="Describe the horrors within this task..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateTodoInput) => ({ ...prev, description: e.target.value }))
                }
                className="retro-input text-lg p-4 min-h-[100px]"
                required
              />
            </div>

            <div className="text-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="retro-button text-2xl px-8 py-4 font-bold"
              >
                {isLoading ? '🔮 SUMMONING...' : '⚡ UNLEASH THE TASK ⚡'}
              </Button>
            </div>
          </form>
        </div>

        {/* Animated GIF separator */}
        <div className="text-center mb-8">
          <img 
            src="https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" 
            alt="Fire separator"
            className="mx-auto w-full max-w-md h-16"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Todos List */}
        <div className="retro-border p-6 bg-black bg-opacity-90">
          <h2 className="text-4xl blood-drip mb-6 text-center flashing">
            💀 YOUR CURSED TASKS 💀
          </h2>

          {todos.length === 0 ? (
            <div className="text-center py-12">
              <img 
                src="https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif" 
                alt="Empty graveyard"
                className="mx-auto w-48 h-48 mb-4"
                style={{ imageRendering: 'pixelated' }}
              />
              <p className="text-2xl creepy-text flashing">
                🪦 THE GRAVEYARD IS EMPTY... FOR NOW 🪦
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {todos.map((todo: Todo) => (
                <div 
                  key={todo.id} 
                  className="retro-border p-4 bg-gradient-to-r from-red-950 to-black relative"
                >
                  <div className="absolute top-2 right-2">
                    <img 
                      src="https://media.giphy.com/media/l0HlDHQEiIdY3kxlm/giphy.gif" 
                      alt="Dripping blood"
                      className="w-8 h-8"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  
                  <h3 className="text-2xl blood-drip mb-3 skull-bullet pr-12">
                    {todo.title}
                  </h3>
                  
                  <p className="text-lg creepy-text mb-4 leading-relaxed">
                    {todo.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm creepy-text opacity-75">
                      🕰️ Created: {todo.created_at.toLocaleDateString()} at {todo.created_at.toLocaleTimeString()}
                    </p>
                    
                    <Button
                      onClick={() => handleDelete(todo.id)}
                      disabled={isDeleting === todo.id}
                      className="retro-button px-6 py-2 text-lg"
                    >
                      {isDeleting === todo.id ? '💀 BANISHING...' : '🗡️ DESTROY'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with animated GIFs */}
        <div className="text-center mt-8 space-y-4">
          <img 
            src="https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif" 
            alt="Spooky footer"
            className="mx-auto w-64 h-16"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-lg creepy-text flashing">
            ⚰️ May your tasks rest in peace... eventually ⚰️
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
