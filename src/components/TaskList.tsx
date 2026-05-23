import React from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { Reorder } from 'framer-motion';
import type { Task } from '../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    activeFilter, 
    searchQuery, 
    sortConfig, 
    reorderTasks 
  } = useApp();

  // Helper to weight priority values for numeric sorting
  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  // 1. Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query matching
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.subtasks.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter type matching
    const todayStr = new Date().toISOString().split('T')[0];
    
    switch (activeFilter) {
      case 'all':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'today':
        return !task.completed && task.dueDate === todayStr;
      case 'upcoming':
        return !task.completed && task.dueDate && task.dueDate > todayStr;
      default:
        // Tag / Category specific listing
        return !task.completed && task.tags.includes(activeFilter);
    }
  });

  // 2. Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    const { field, order } = sortConfig;

    if (field === 'priority') {
      comparison = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    } else if (field === 'dueDate') {
      if (!a.dueDate) return 1; // Put tasks without due date at the end
      if (!b.dueDate) return -1;
      comparison = a.dueDate.localeCompare(b.dueDate);
    } else if (field === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (field === 'createdAt') {
      comparison = b.createdAt.localeCompare(a.createdAt);
    }

    return order === 'desc' ? comparison : -comparison;
  });

  // Reorder sync wrapper
  const handleReorder = (newOrderedList: Task[]) => {
    // To preserve overall ordering outside the filtered sublist, 
    // we map reordered items back into the central list of tasks
    const reorderedIds = newOrderedList.map(t => t.id);
    const unchanged = tasks.filter(t => !reorderedIds.includes(t.id));
    
    // Put reordered tasks at the top, followed by unchanged tasks
    reorderTasks([...newOrderedList, ...unchanged]);
  };

  if (sortedTasks.length === 0) {
    return <EmptyState />;
  }

  // If sorting is NOT manual or there's a search query, drag-and-drop reordering is temporarily locked to avoid glitches.
  // We enable Reorder when list is simple and sorted by priority (standard manual list reordering default) or when in inbox.
  // Standard framer-motion Reorder works beautifully when items are bound directly.
  return (
    <Reorder.Group
      values={sortedTasks}
      onReorder={handleReorder}
      className="space-y-3.5"
      axis="y"
    >
      {sortedTasks.map((task) => (
        <Reorder.Item
          key={task.id}
          value={task}
          className="focus:outline-none touch-none"
        >
          <TaskItem task={task} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
