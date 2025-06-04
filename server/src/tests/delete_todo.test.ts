
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

const testTodo = {
  title: 'Test Todo',
  description: 'A todo for testing deletion'
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    const created = await db.insert(todosTable)
      .values(testTodo)
      .returning()
      .execute();

    const todoId = created[0].id;

    // Delete the todo
    const input: DeleteTodoInput = { id: todoId };
    const result = await deleteTodo(input);

    expect(result.success).toBe(true);

    // Verify the todo is deleted from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false when deleting non-existent todo', async () => {
    const nonExistentId = 99999;
    const input: DeleteTodoInput = { id: nonExistentId };
    
    const result = await deleteTodo(input);

    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple todos
    const todo1 = await db.insert(todosTable)
      .values({ title: 'Todo 1', description: 'First todo' })
      .returning()
      .execute();

    const todo2 = await db.insert(todosTable)
      .values({ title: 'Todo 2', description: 'Second todo' })
      .returning()
      .execute();

    // Delete only the first todo
    const input: DeleteTodoInput = { id: todo1[0].id };
    const result = await deleteTodo(input);

    expect(result.success).toBe(true);

    // Verify first todo is deleted
    const deletedTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todo1[0].id))
      .execute();

    expect(deletedTodos).toHaveLength(0);

    // Verify second todo still exists
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todo2[0].id))
      .execute();

    expect(remainingTodos).toHaveLength(1);
    expect(remainingTodos[0].title).toEqual('Todo 2');
  });
});
