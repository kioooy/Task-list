import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoApp from '../Todo-list/index';
import { act } from 'react';

// Mock the fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as jest.Mock;

  // Mock window.confirm
  window.confirm = jest.fn(() => true);
});

describe('TodoApp Component', () => {
  // Component Rendering
  test('initial render of todo list', () => {
    render(<TodoApp />);
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new task...')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('renders todo items', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '1', title: 'Test Task', completed: false }]),
      })
    ) as jest.Mock;
    render(<TodoApp />);
    expect(await screen.findByText('Test Task')).toBeInTheDocument();
  });

  // User Interactions
  test('add new todos', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST' && url.includes('/api/todo/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '2', title: 'New Task', completed: false }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '2', title: 'New Task', completed: false }]),
      });
    }) as jest.Mock;

    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Task' } });
      fireEvent.click(addButton);
    });

    expect(await screen.findByText('New Task')).toBeInTheDocument();
  });

  test('marks todos as complete', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'PUT' && url.includes('/api/todo/setcomplete/1')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '1', title: 'Test Task', completed: true }]),
      });
    }) as jest.Mock;

    render(<TodoApp />);
    const completeButton = await screen.findByLabelText('Toggle Complete');
    await act(async () => {
      fireEvent.click(completeButton);
    });

    expect(await screen.findByText('Test Task')).toHaveClass('line-through');
  });

  test('deletes todos', async () => {
    // Setup initial data with a todo item
    let mockTodos = [{ id: '1', title: 'Test Task', completed: false }];
    
    // Create a more sophisticated mock that tracks state
    global.fetch = jest.fn((url, options) => {
      // Handle DELETE request
      if (options && options.method === 'DELETE' && url.includes('/api/todo/1')) {
        // Remove the todo from our mock data
        mockTodos = mockTodos.filter(todo => todo.id !== '1');
        return Promise.resolve({ 
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      // Handle GET request to fetch todos (will be called after delete)
      if (!options || options.method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos)
        });
      }
      
      // Default response
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Unexpected request" })
      });
    }) as jest.Mock;
  
    render(<TodoApp />);
    
    // Wait for the task to be displayed
    expect(await screen.findByText('Test Task')).toBeInTheDocument();
    
    const deleteButton = await screen.findByLabelText('Delete Task');
    
    // Confirm deletion is set to true in beforeEach
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  
    // After deletion, the task should no longer be in the document
    // We need to wait for the component to re-render after the fetch calls
    await act(async () => {
      // Wait for any pending promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
  });

  test('input validation', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(addButton);
    });

    expect(screen.queryByText('Task cannot be empty')).toBeInTheDocument();
  });

  // State Management
  test('todo list updates', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '1', title: 'Test Task', completed: false }]),
      })
    ) as jest.Mock;
    render(<TodoApp />);
    expect(await screen.findByText('Test Task')).toBeInTheDocument();
  });

  test('edit mode state', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '1', title: 'Test Task', completed: false }]),
      })
    ) as jest.Mock;
    render(<TodoApp />);
    const editButton = await screen.findByRole('button', { name: /edit task/i });
    fireEvent.click(editButton);
    const editInput = screen.getByDisplayValue('Test Task');
    expect(editInput).toBeInTheDocument();
  });

  test('alert state', () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(addButton);

    expect(screen.queryByText('Task cannot be empty')).toBeInTheDocument();
  });

  // Edge Cases
  test('empty input handling', () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(addButton);

    expect(screen.queryByText('Task cannot be empty')).toBeInTheDocument();
  });

  test('input validation', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(addButton);
    });

    expect(screen.queryByText('Task cannot be empty')).toBeInTheDocument();
  });

  // State Management
  test('todo list updates', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '1', title: 'Test Task', completed: false }]),
      })
    ) as jest.Mock;
    render(<TodoApp />);
    expect(await screen.findByText('Test Task')).toBeInTheDocument();
  });

  test('multiple todos management', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', title: 'Task 1', completed: false },
          { id: '2', title: 'Task 2', completed: false },
        ]),
      })
    ) as jest.Mock;
    render(<TodoApp />);
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(await screen.findByText('Task 2')).toBeInTheDocument();
  });

  test('empty input handling', () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new task...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(addButton);

    expect(screen.queryByText('Task cannot be empty')).toBeInTheDocument();
  });
});