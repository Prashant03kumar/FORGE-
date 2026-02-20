import React, { useState } from "react";
import { Plus, Edit3, Save, Trash2, Clock, CheckCircle } from "lucide-react";

const TaskList = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Deep Work: React Forge",
      desc: "Build the task list logic",
      time: "09:00 AM",
      completed: false,
      isEditing: false,
    },
    {
      id: 2,
      title: "Gym: Leg Day",
      desc: "Squats and lunges",
      time: "05:00 PM",
      completed: false,
      isEditing: false,
    },
  ]);

  const toggleEdit = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isEditing: !t.isEditing } : t)),
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Today's Tasks</h2>
          <p className="text-sm text-gray-400 font-medium">
            Focus on one thing at a time.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#FF6B00] text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-[#FF6B00]/20">
          <Plus size={18} />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${task.completed ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100 hover:border-orange-200 shadow-sm"}`}
          >
            {/* Left: Checkbox & Info */}
            <div className="flex items-center gap-6 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() =>
                  setTasks(
                    tasks.map((t) =>
                      t.id === task.id ? { ...t, completed: !t.completed } : t,
                    ),
                  )
                }
                className="w-6 h-6 rounded-lg border-2 border-gray-200 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer"
              />

              <div className="flex-1">
                {task.isEditing ? (
                  <div className="space-y-2">
                    <input
                      className="w-full text-lg font-bold outline-none border-b border-orange-400"
                      defaultValue={task.title}
                    />
                    <input
                      className="w-full text-sm text-gray-500 outline-none border-b border-gray-200"
                      defaultValue={task.desc}
                    />
                  </div>
                ) : (
                  <>
                    <h4
                      className={`text-lg font-bold ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-400">{task.desc}</p>
                  </>
                )}
              </div>
            </div>

            {/* Middle: Time */}
            <div className="flex items-center gap-2 px-6 text-gray-400">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {task.time}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleEdit(task.id)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title={task.isEditing ? "Save Task" : "Edit Task"}
              >
                {task.isEditing ? (
                  <Save size={20} className="text-blue-500" />
                ) : (
                  <Edit3 size={20} className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
