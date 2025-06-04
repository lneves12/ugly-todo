
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        {
          title: 'First Todo',
          description: 'First description'
        },
        {
          title: 'Second Todo', 
          description: 'Second description'
        }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].description).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return todos ordered by created_at descending', async () => {
    // Create todos with slight delay to ensure different timestamps
    await db.insert(todosTable)
      .values({
        title: 'First Todo',
        description: 'Created first'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable)
      .values({
        title: 'Second Todo',
        description: 'Created second'
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    // Most recent should be first
    expect(result[0].title).toEqual('Second Todo');
    expect(result[1].title).toEqual('First Todo');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return todos with all expected fields', async () => {
    await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'Test description'
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    const todo = result[0];
    
    expect(todo.id).toBeDefined();
    expect(typeof todo.id).toBe('number');
    expect(todo.title).toEqual('Test Todo');
    expect(todo.description).toEqual('Test description');
    expect(todo.created_at).toBeInstanceOf(Date);
  });
});
