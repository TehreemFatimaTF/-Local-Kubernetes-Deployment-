---
name: nextjs-frontend
description: Implement and manage Next.js 14 frontend components, pages, and API routes for Todo App
owner: Frontend Developer
tags: [nextjs, react, frontend, components, pages, api-routes, phase-2]
---

## Purpose

Implement and manage the Next.js 14 frontend for the Todo App by:
- Creating React components that match UI specifications
- Building pages with proper routing and navigation
- Implementing API routes and data fetching
- Managing state and user interactions
- Ensuring responsive design and accessibility
- Connecting to backend API endpoints

## When to Use

Invoke this skill when:
- Creating new frontend pages or components
- Implementing UI features that match specifications
- Connecting frontend to backend API endpoints
- Adding state management and user interactions
- Implementing responsive design and accessibility
- Setting up Next.js specific configurations

**Trigger phrases:**
- "Create Next.js component for [feature]"
- "Build [page-name] page in Next.js"
- "Implement frontend for [feature]"
- "Add API route for [functionality]"
- "Create React component for [UI element]"

## Inputs

**Required:**
- `feature_name` - The feature to implement (must have corresponding spec file)

**Optional:**
- `focus_area` - Specific aspect: "components", "pages", "api-routes", "state-management", "styling", "all" (default: "all")
- `implementation_style` - Approach: "app-router", "pages-router", "hybrid" (default: "app-router")

**Example invocations:**
```
Create Next.js component for task-list
Build dashboard page in Next.js
Implement frontend for task-crud
Add API route for task creation
Create React component for task-item
```

## Step-by-Step Process

### 1. Load Specification

**Locate and read spec file:**
```bash
# Identify feature spec
SPEC_FILE="specs/ui/${feature_name}/spec.md"

# Verify spec exists
if [ ! -f "$SPEC_FILE" ]; then
    echo "❌ ERROR: UI spec not found at $SPEC_FILE"
    exit 1
fi
```

**Extract from spec:**
- Component requirements and structure
- Page layout and navigation
- State management needs
- API endpoints to consume
- Styling requirements
- Accessibility requirements
- Responsive design needs

**Parse UI requirements:**
```
Example spec section:
## UI Components

- TaskList: Displays all tasks with filtering
- TaskItem: Individual task with title, status, actions
- TaskForm: Form for creating/updating tasks
- Navigation: Header with app navigation
```

Create implementation checklist:
```markdown
## UI Implementation Checklist
- [ ] TaskList component created
- [ ] TaskItem component created
- [ ] TaskForm component created
- [ ] Navigation component created
- [ ] API integration implemented
- [ ] Styling applied per spec
```

### 2. Identify Implementation Structure

**Determine Next.js structure:**
```bash
# For App Router (recommended for Next.js 14)
# Pages go in app/ directory
APP_DIR="frontend/app"

# Components go in components/ directory
COMPONENTS_DIR="frontend/components"

# API routes go in app/api/ directory
API_DIR="frontend/app/api"
```

**Expected locations for Next.js Todo App:**
- `frontend/app/` - Next.js app router pages
- `frontend/components/` - Reusable React components
- `frontend/lib/` - Utility functions and API calls
- `frontend/styles/` - Global and component styles
- `frontend/types/` - TypeScript type definitions

### 3. Create Page Structure

**For each page in spec, create Next.js page:**

For App Router approach:
```
frontend/app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── tasks/             # Tasks section
│   ├── page.tsx       # Tasks list page
│   └── [id]/          # Individual task
│       └── page.tsx   # Task detail page
└── globals.css        # Global styles
```

**Example page implementation:**

Spec says:
```
Page: Tasks List
Route: /tasks
Components: TaskList, TaskItem
Data: Fetch all tasks from /api/tasks
```

Implementation:
```tsx
// frontend/app/tasks/page.tsx
import { TaskList } from '@/components/TaskList';

export default async function TasksPage() {
  // Server-side data fetching
  const response = await fetch(`${process.env.API_BASE_URL}/api/tasks`);
  const tasks = await response.json();

  return (
    <div className="container">
      <h1>Tasks</h1>
      <TaskList tasks={tasks} />
    </div>
  );
}
```

**Page structure checklist:**
- [ ] Page component created in correct location
- [ ] Server-side data fetching implemented (if needed)
- [ ] Client-side interactions handled (if needed)
- [ ] Proper error handling implemented
- [ ] Loading states implemented
- [ ] Meta tags and SEO implemented

### 4. Create React Components

**For each UI component in spec, create React component:**

#### TaskItem Component
```tsx
// frontend/components/TaskItem.tsx
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle?.(task.id)}
        aria-label={`Toggle task ${task.title}`}
      />
      <span className={task.completed ? 'completed' : ''}>
        {task.title}
      </span>
      <div className="task-actions">
        <button onClick={() => onEdit?.(task)}>Edit</button>
        <button onClick={() => onDelete?.(task.id)}>Delete</button>
      </div>
    </div>
  );
}
```

#### TaskList Component
```tsx
// frontend/components/TaskList.tsx
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="no-tasks">No tasks found</div>;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
```

#### TaskForm Component
```tsx
// frontend/components/TaskForm.tsx
import { useState } from 'react';
import { Task } from '@/types/task';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id'>) => void;
  initialTask?: Partial<Task>;
}

export function TaskForm({ onSubmit, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, completed: false });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        required
      />
      <button type="submit">Add Task</button>
    </form>
  );
}
```

**Component creation checklist:**
- [ ] Component created with proper TypeScript types
- [ ] Props properly typed and validated
- [ ] Accessibility attributes implemented
- [ ] Responsive design considerations
- [ ] Error boundaries if needed
- [ ] Loading states handled

### 5. Implement API Integration

**Create API service layer:**

```ts
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ApiError {
  message: string;
  status: number;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function updateTask(id: number, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message);
  }
}
```

**API integration checklist:**
- [ ] API service functions created
- [ ] Proper error handling implemented
- [ ] Environment variables used for API URLs
- [ ] TypeScript types applied to responses
- [ ] Request/response validation
- [ ] Authentication headers if needed

### 6. Implement State Management

**Choose appropriate state management:**

For simple state (component level):
```tsx
// Using React useState and useEffect
import { useState, useEffect } from 'react';
import { getTasks } from '@/lib/api';

export function TaskListContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return <TaskList tasks={tasks} />;
}
```

For complex state (global level):
```tsx
// Using React Context API
// frontend/context/TaskContext.tsx
import { createContext, useContext, useReducer } from 'react';
import { Task } from '@/types/task';

type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_ERROR'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number };

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_TASKS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TASKS_SUCCESS':
      return { ...state, loading: false, tasks: action.payload };
    case 'FETCH_TASKS_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
} | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
```

**State management checklist:**
- [ ] Appropriate state management approach chosen
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Data synchronization with backend
- [ ] Optimistic updates (if needed)
- [ ] Caching strategies (if needed)

### 7. Implement Styling and Responsive Design

**Create styling system:**

Using Tailwind CSS (recommended for Next.js):
```tsx
// frontend/components/TaskItem.tsx with Tailwind
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle?.(task.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          aria-label={`Toggle task ${task.title}`}
        />
        <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.title}
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit?.(task)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete?.(task.id)}
          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

**Responsive design implementation:**
```tsx
// Using Tailwind responsive classes
export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

**Styling checklist:**
- [ ] Consistent design system applied
- [ ] Responsive design implemented
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Cross-browser compatibility
- [ ] Dark mode support (if specified)

### 8. Implement Accessibility Features

**Add accessibility attributes:**

```tsx
// Accessible TaskForm component
export function TaskForm({ onSubmit, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSubmit({ title, completed: false });
    setTitle('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" aria-label="Add new task">
      <div className="form-group">
        <label htmlFor="task-title" className="form-label">
          Task Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter task title"
          required
          className={`form-input ${error ? 'border-red-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? "task-title-error" : undefined}
        />
        {error && (
          <div id="task-title-error" className="error-message text-red-500 text-sm mt-1">
            {error}
          </div>
        )}
      </div>
      <button type="submit" className="btn btn-primary">
        Add Task
      </button>
    </form>
  );
}
```

**Accessibility checklist:**
- [ ] Semantic HTML elements used
- [ ] ARIA attributes implemented
- [ ] Keyboard navigation supported
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG
- [ ] Focus management implemented

### 9. Generate Implementation Report

**Create detailed implementation report:**

```markdown
# Next.js Frontend Implementation Report: [Feature Name]

## Specification Reference
- **Spec File:** specs/ui/[feature-name]/spec.md
- **Implementation Date:** 2025-12-24
- **Developer:** Frontend Developer

## Component Implementation Results

### TaskItem Component
- **Status:** ✅ COMPLETE
- **Evidence:** Component created with proper TypeScript types
- **Features:** Checkbox toggle, edit/delete buttons, accessibility attributes
- **Responsive:** Mobile and desktop layouts implemented

### TaskList Component
- **Status:** ✅ COMPLETE
- **Evidence:** Component handles empty states and loading
- **Features:** Grid layout with responsive columns
- **Performance:** Optimized rendering with React keys

### TaskForm Component
- **Status:** ⚠️ PARTIAL
- **Evidence:** Basic form implemented with validation
- **Missing:** Error boundary implementation
- **Impact:** LOW (form works but could be more robust)

## Page Structure Implementation

### Tasks Page (/tasks)
- ✅ Page component created
- ✅ Server-side data fetching implemented
- ✅ Client-side interactions handled
- ✅ Loading and error states implemented
- ✅ SEO meta tags added

## API Integration

### GET /api/tasks
- ✅ Service function created
- ✅ Error handling implemented
- ✅ TypeScript types applied
- ✅ Environment variables used

### POST /api/tasks
- ✅ Service function created
- ✅ Request validation implemented
- ✅ Response handling implemented
- ✅ Error messaging clear

## State Management

### Local State
- ✅ useState hooks implemented
- ✅ useEffect for data fetching
- ✅ Loading states handled
- ✅ Error states managed

### Global State (Context)
- ✅ Context provider created
- ✅ Reducer pattern implemented
- ✅ Action types defined
- ✅ State updates optimized

## Styling and Responsive Design

### Tailwind CSS
- ✅ Consistent design system applied
- ✅ Responsive breakpoints implemented
- ✅ Hover and focus states
- ✅ Dark mode support (if needed)

### Component Styling
- ✅ TaskItem: Flex layout with proper spacing
- ✅ TaskList: Grid with responsive columns
- ✅ TaskForm: Accessible form elements
- ✅ Navigation: Mobile-friendly menu

## Accessibility Implementation

### ARIA Attributes
- ✅ Labels for form elements
- ✅ Describedby for error messages
- ✅ Invalid states for validation
- ✅ Role attributes where needed

### Keyboard Navigation
- ✅ Tab order maintained
- ✅ Focus indicators visible
- ✅ Skip links implemented
- ✅ Modal focus trapping

## Summary

### Overall Status: ✅ COMPLETE

**Components Created:** 3/3
**Pages Implemented:** 1/1
**API Integration:** 4/4 endpoints
**Accessibility:** 8/10 requirements met
**Responsive Design:** All breakpoints working

### Recommendations
1. Add error boundaries for production
2. Implement additional form validation
3. Add loading skeletons for better UX
4. Consider using a state management library for complex features

### Next Steps
- [ ] Deploy to Vercel
- [ ] Test on different devices
- [ ] Performance optimization
- [ ] User acceptance testing
```

## Output

**Success case (all components implemented):**
```
✅ NEXT.JS FRONTEND IMPLEMENTATION COMPLETE: [Feature Name]

📋 Components: 5/5 created (100%)
✅ Pages: All routes implemented
✅ API Integration: All endpoints connected
✅ State Management: Proper patterns applied
✅ Styling: Responsive and accessible

🎯 IMPLEMENTATION COMPLETE
✅ READY FOR INTEGRATION TESTING

[Link to detailed implementation report]
```

**Partial completion (missing features):**
```
⚠️ NEXT.JS FRONTEND IMPLEMENTATION: [Feature Name]

📋 Components: 4/5 created, 1/5 pending
✅ Pages: All routes implemented
⚠️ API Integration: 3/4 endpoints connected
✅ State Management: Basic patterns applied
✅ Styling: Responsive design implemented

Pending:
1. Task detail page (MEDIUM priority)
2. Advanced filtering (LOW priority)

🎯 CONDITIONAL COMPLETE
✅ Can proceed with integration, missing components will be added

[Link to detailed implementation report]
```

**Failure case (blocking issues):**
```
❌ NEXT.JS FRONTEND IMPLEMENTATION FAILED: [Feature Name]

📋 Components: 2/5 created, 3/5 FAILED
❌ Critical Issues Found:
   1. TaskList component crashes on empty data (HIGH)
   2. API integration not working (HIGH)
   3. No accessibility features implemented (MEDIUM)

🚫 BLOCKING ISSUES PREVENT PROGRESS

Required fixes:
1. Fix TaskList empty state handling
2. Connect to backend API properly
3. Add basic accessibility attributes

📋 Return to implementation
🔒 Re-implement after fixes

[Link to detailed implementation report]
```

## Failure Handling

### Spec File Not Found
- Check if feature name is correct
- Verify spec exists in `specs/ui/[feature-name]/spec.md`
- If spec missing: BLOCK and require spec creation
- Cannot implement frontend without specification

### Implementation Not Found
- Check if Next.js project structure exists
- Verify frontend directory structure
- If missing: Report as incomplete project setup
- Cannot implement without proper project structure

### API Endpoint Undefined
- Flag missing API endpoints in report
- Request backend API specification
- Document assumption if implementation proceeds
- Recommend updating spec for clarity

### Styling Requirements Ambiguous
**If strict_mode = true:**
- FAIL if styling doesn't match spec exactly
- Require exact design system compliance

**If strict_mode = false (default):**
- PASS if general design goals met
- FLAG if styling differs significantly
- Recommend alignment for consistency

### Accessibility Requirements Missing
- Flag any accessibility features not implemented
- Document current accessibility state
- Recommend adding accessibility to spec if intentional
- Consider as potential compliance gap

## Quality Gates

**PASS (approved for next step):**
- ✅ All required components created
- ✅ Pages route correctly
- ✅ API integration functional
- ✅ Basic accessibility implemented
- ✅ Responsive design working
- ✅ No blocking issues

**CONDITIONAL PASS (proceed with documentation):**
- ⚠️ ≥80% components implemented
- ⚠️ Basic functionality working
- ⚠️ Core API integration functional
- ✅ No critical bugs
- ✅ Can be demoed with known limitations

**FAIL (blocking, cannot proceed):**
- ❌ <80% components implemented
- ❌ Critical functionality broken
- ❌ API integration not working
- ❌ Accessibility completely missing
- ❌ Major UI/UX issues

## Integration with SDD Workflow

**After implementation:**
1. If PASS: Proceed to integration testing, create PHR (stage: green)
2. If CONDITIONAL: Document limitations, proceed with notes
3. If FAIL: Block progress, create bug-fix tasks, create PHR (stage: red)

**Traceability:**
- Link implementation report to UI spec file
- Reference component requirements in results
- Create tasks for missing features
- Document design decisions in ADR if significant

## Examples

### Example 1: Complete Implementation
```
Input: "Create Next.js component for task-list"

Output:
✅ IMPLEMENTATION COMPLETE: task-list
📋 All 3 components created (TaskList, TaskItem, TaskForm)
✅ Pages: tasks route implemented
✅ API: getTasks, createTask integrated
✅ State: React hooks pattern applied
✅ Styling: Responsive with Tailwind

Implemented:
- TaskList component: ✅ Grid layout with responsive design
- TaskItem component: ✅ Interactive with toggle/delete
- TaskForm component: ✅ Validated with error handling
- Tasks page: ✅ Server-side rendering
- API integration: ✅ Error handling included

🎯 READY FOR INTEGRATION
```

### Example 2: Partial Implementation
```
Input: "Build dashboard page in Next.js"

Output:
⚠️ IMPLEMENTATION: dashboard page
📋 2/3 components created, 1 pending

Completed:
- Dashboard layout: ✅ Responsive grid
- Task summary: ✅ API integration working
- Stats component: ✅ Basic functionality

Pending:
- Charts visualization: ⚠️ Not implemented yet
  Reason: Charting library decision pending
  Impact: MEDIUM (dashboard less informative)

✅ CAN PROCEED with basic dashboard
📝 Will implement charts in next iteration
```

### Example 3: Critical Issues
```
Input: "Implement frontend for task-crud"

Output:
❌ IMPLEMENTATION FAILED: task-crud
📋 1/4 components working, 3/4 FAILED

CRITICAL FAILURES:
- TaskForm crashes on submit (HIGH)
  Evidence: TypeError when creating task
  Impact: CRITICAL (no way to add tasks)

- API calls not configured (HIGH)
  Evidence: 404 errors on all endpoints
  Impact: HIGH (no data interaction)

- No error handling (MEDIUM)
  Evidence: Unhandled promise rejections
  Impact: MEDIUM (poor user experience)

Partially working:
- TaskList display: ✅ Shows tasks if loaded

🚫 BLOCKED: Cannot proceed
📋 Required fixes:
   1. Fix TaskForm submit handler
   2. Configure API base URL
   3. Add error boundaries
   4. Re-test after fixes
```