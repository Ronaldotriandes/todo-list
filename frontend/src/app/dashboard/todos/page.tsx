'use client';

import AddTodoModal from '@/components/todos/components/AddTodoModal';
import EditTodoModal from '@/components/todos/components/EditTodoModal';
import Button from '@/components/ui/Button';
import { useTodoStore } from '@/stores/todoStore';
import { useEffect, useState } from 'react';

export default function TodosPage() {
  const {
    todos,
    fetchTodos,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    deleteTodo,
    updateTodo,
    setCurrentPage
  } = useTodoStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTodos(currentPage, searchTerm);
  }, [fetchTodos, currentPage, searchTerm]);

  const handleAddSuccess = () => {
    fetchTodos(currentPage, searchTerm);
    setIsAddModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchTodos(currentPage, searchTerm);
    setEditingTodo(null);
  };

  const handleDelete = async (todoId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTodo(todoId);
        fetchTodos(currentPage, searchTerm);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleStatusChange = async (todo: any, newStatus: string) => {
    try {
      await updateTodo(todo.id, {
        ...todo,
        status: newStatus,
        completed: newStatus === 'done',
      });
      fetchTodos(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchTodos(page, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;

  const getItemNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'onProgress':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'onProgress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'done':
        return 'Done';
      case 'canceled':
        return 'Canceled';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-2">
            Organize and track your tasks efficiently
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Task
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search todos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            {searchTerm && (
              <div className="ml-4 text-sm text-gray-600">
                {totalItems} result{totalItems !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="w-96 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-400 text-6xl mb-4">📝</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No tasks found' : 'No tasks yet'}
                          </h3>
                          <p className="text-gray-600">
                            {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first task!'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      todos.map((todo, index) => (
                        <tr key={todo.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {getItemNumber(index)}
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {todo.title}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm text-gray-900 truncate" title={todo.description}>
                              {todo.description}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="text-xs">
                              {formatDate(todo.dueDate)}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(todo.status)}`}>
                              {getStatusText(todo.status)}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTodo(todo)}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs px-2 py-1"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(todo.id)}
                                className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 py-1"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages >= 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{totalItems}</span> results
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </Button>

                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              variant={currentPage === page ? "primary" : "outline"}
                              size="sm"
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </Button>
                          )
                        ))}

                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          isOpen={true}
          onClose={() => setEditingTodo(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}