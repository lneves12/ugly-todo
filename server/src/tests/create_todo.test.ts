
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Test Todo',
  description: 'A todo for testing'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Test Todo');
    expect(todos[0].description).toEqual('A todo for testing');
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple todos with different data', async () => {
    const input1: CreateTodoInput = {
      title: 'First Todo',
      description: 'First description'
    };

    const input2: CreateTodoInput = {
      title: 'Second Todo',
      description: 'Second description'
    };

    const result1 = await createTodo(input1);
    const result2 = await createTodo(input2);

    // Verify both todos were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('First Todo');
    expect(result2.title).toEqual('Second Todo');
    expect(result1.description).toEqual('First description');
    expect(result2.description).toEqual('Second description');
  });
});
