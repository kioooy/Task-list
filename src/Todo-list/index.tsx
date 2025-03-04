import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Định nghĩa kiểu cho task
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const API_BASE_URL = "http://localhost:8080/api/todo";

const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [invalidEdit, setInvalidEdit] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      toast.error("Task cannot be empty");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim() }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      fetchTasks();
      setNewTask("");
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Title todo must not contain special characters")

    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasks();
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (id: string) => {
    if (!editingText.trim() || /[!@#$%^&*(),.?":{}|<>]/.test(editingText)) {
      toast.error("Task cannot be empty or contain special characters");
      setInvalidEdit(true); // Đánh dấu ô nhập có lỗi
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingText.trim() }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      fetchTasks();
      setEditingTask(null);
      setInvalidEdit(false); // Nếu thành công, bỏ trạng thái lỗi
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      setInvalidEdit(true); // Nếu lỗi, tiếp tục giữ màu đỏ
    }
  };
  

  const toggleComplete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/setcomplete/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update task status");
      fetchTasks();
      toast.success("Task status updated!");
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Task List</h1>
          <ToastContainer autoClose={3000} />

          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              placeholder="Enter new task..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button onClick={addTask} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FiPlus className="h-5 w-5 mr-2" /> Add
            </button>
          </div>

          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.p className="text-center text-gray-500 my-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                No tasks yet. Add some to get started!
              </motion.p>
            ) : (
              <motion.ul className="space-y-3" layout initial="hidden" animate="visible" exit="exit">
                {tasks.map((task: Task) => (
                  <motion.li key={task.id} className={`flex items-center justify-between p-4 rounded-md hover:bg-gray-100 transition-colors duration-150 ${invalidEdit && editingTask === task.id ? "bg-red-200 border border-red-500" : "bg-gray-50"}`}>
                    <div className="flex items-center flex-1 space-x-3">
                      <button
                        aria-label="Toggle Complete"
                        onClick={() => toggleComplete(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-blue-500"}`}
                      >
                        {task.completed && <FiCheck className="w-4 h-4 text-white" />}
                      </button>
                      {editingTask === task.id ? (
                        <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => updateTask(task.id)}
                        onKeyPress={(e) => e.key === "Enter" && updateTask(task.id)}
                        autoFocus  
                        className={`flex-1 rounded-md border shadow-sm focus:ring-1 ${
                          invalidEdit ? "border-red-500 bg-red-100 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                      />
                      
                      ) : (
                        <span className={`${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>{task.title}</span>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        aria-label="Edit Task"
                        onClick={() => { setEditingTask(task.id); setEditingText(task.title); setInvalidEdit(false); }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Delete Task"
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
