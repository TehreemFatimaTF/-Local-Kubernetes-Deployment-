---
name: spec-driven-developer
description: Implement features following the GitHub Spec-Kit methodology, ensuring all development aligns with specifications in @specs/ directory for hackathon-todo.
owner: Spec Developer
tags: [specification, requirements, implementation, compliance, phase-1, phase-2]
---

## Purpose

Implement features following the GitHub Spec-Kit methodology for the Todo application, ensuring all development strictly aligns with specifications in the @specs/ directory by:
- Reading and referencing relevant specs before implementing any feature
- Ensuring all code implementations match the specifications exactly
- Updating specs when requirements change during development
- Validating that implementations satisfy all spec requirements
- Cross-referencing multiple spec files when needed (@specs/features/*.md, @specs/api/*.md, @specs/database/*.md, @specs/ui/*.md)

## When to Use

Invoke this skill when:
- Starting implementation of a new feature based on specifications
- Ensuring code compliance with existing specs
- Validating that implementations satisfy all spec requirements
- Cross-referencing multiple spec files during development
- Updating specs when requirements change during implementation
- Identifying gaps between specs and implementation requirements

**Trigger phrases:**
- "Implement [feature] following spec"
- "Check spec compliance for [feature]"
- "Reference spec for [requirement]"
- "Update implementation per spec"
- "Validate against spec requirements"

## Inputs

**Required:**
- `feature_name` - The feature to implement (must have corresponding spec file)

**Optional:**
- `spec_area` - Specific spec area: "features", "api", "database", "ui", "security", "all" (default: "all")
- `implementation_phase` - Development phase: "phase-1", "phase-2", "both" (default: "current")
- `strict_mode` - Fail on ANY deviation from spec, even minor (default: false)

**Example invocations:**
```
Implement add-task feature following spec
Check spec compliance for user-authentication
Reference spec for database schema requirements
Update implementation per feature spec
Validate task-crud against requirements
```

## Step-by-Step Process

### 1. Load Specification

**Locate and read spec file:**
```bash
# Identify feature spec
SPEC_FILE="specs/${spec_area}/${feature_name}/spec.md"

# Verify spec exists
if [ ! -f "$SPEC_FILE" ]; then
    echo "❌ ERROR: Spec not found at $SPEC_FILE"
    exit 1
fi
```

**Extract from spec:**
- Feature overview and purpose
- Functional requirements
- Non-functional requirements
- Acceptance criteria (AC-001, AC-002, etc.)
- API endpoint definitions
- Database schema requirements
- UI component specifications
- Error handling requirements
- Performance requirements
- Security requirements

**Parse requirements:**
```
Example spec section:
## Requirements

- REQ-001: User can add a todo with a title
- REQ-002: System assigns a unique numeric ID
- REQ-003: System returns confirmation message
- REQ-004: Empty title is rejected with error
- REQ-005: System stores todos in database
```

Create implementation checklist:
```markdown
## Implementation Checklist
- [ ] REQ-001: User can add a todo with a title
- [ ] REQ-002: System assigns a unique numeric ID
- [ ] REQ-003: System returns confirmation message
- [ ] REQ-004: Empty title is rejected with error
- [ ] REQ-005: System stores todos in database
```

### 2. Identify Implementation Structure

**Determine project structure based on phase:**

For Phase 1 (CLI Todo App):
```bash
# Python CLI application structure
BACKEND_DIR="src"
BACKEND_FILES=(
    "todo.py"           # Core todo operations
    "storage.py"        # Data storage
    "cli.py"            # CLI interface
    "main.py"           # Entry point
    "config.py"         # Configuration
)
```

For Phase 2 (Fullstack Todo App):
```bash
# Fullstack application structure
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

FRONTEND_DIRS=(
    "app"               # Next.js app router
    "components"        # React components
    "lib"              # Utilities and API calls
    "types"            # TypeScript definitions
    "hooks"            # React hooks
    "styles"           # Styling
)

BACKEND_DIRS=(
    "models"           # Data models
    "routes"           # API routes
    "utils"            # Utilities
    "auth"             # Authentication
    "database"         # Database operations
)
```

**Expected locations by spec area:**
- `specs/features/` - Feature specifications → `src/` or `backend/` + `frontend/`
- `specs/api/` - API specifications → `backend/routes/` + `frontend/lib/api.ts`
- `specs/database/` - Database specifications → `backend/models/` + `backend/database/`
- `specs/ui/` - UI specifications → `frontend/components/` + `frontend/app/`
- `specs/security/` - Security specifications → `backend/auth/` + `frontend/hooks/useAuth.ts`

### 3. Cross-Reference Multiple Specs

**Identify related spec files:**
```bash
# Find all related specs
RELATED_SPECS=(
    "specs/features/${feature_name}/spec.md"
    "specs/api/${feature_name}/spec.md"
    "specs/database/${feature_name}/spec.md"
    "specs/ui/${feature_name}/spec.md"
    "specs/security/${feature_name}/spec.md"
)

# Filter for existing specs
EXISTING_SPECS=()
for spec in "${RELATED_SPECS[@]}"; do
    if [ -f "$spec" ]; then
        EXISTING_SPECS+=("$spec")
    fi
done
```

**Cross-reference requirements:**
- API specs define endpoint contracts
- Database specs define data models
- UI specs define user interactions
- Security specs define authentication/authorization
- Feature specs define business logic

**Consistency validation:**
- Ensure API endpoints match database schema
- Verify UI components match API contracts
- Confirm security requirements are implemented
- Validate that all specs align with feature requirements

### 4. Implement Backend Components

**For API specs, create backend routes:**

Python FastAPI example:
```python
# backend/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.task import Task, TaskCreate, TaskUpdate

router = APIRouter()

@router.get("/tasks", response_model=List[Task])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """
    Retrieve tasks.
    """
    tasks = session.exec(select(Task).offset(skip).limit(limit)).all()
    return tasks

@router.post("/tasks", response_model=Task)
def create_task(
    task: TaskCreate,
    session: Session = Depends(get_session)
):
    """
    Create a new task.
    """
    db_task = Task.from_orm(task)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/tasks/{task_id}", response_model=Task)
def get_task(
    task_id: int,
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID.
    """
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session)
):
    """
    Update a specific task.
    """
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    session: Session = Depends(get_session)
):
    """
    Delete a specific task.
    """
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}
```

**For database specs, create models:**
```python
# backend/models/task.py
from sqlmodel import SQLModel, Field, create_engine
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium", regex="^(low|medium|high)$")

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")

class TaskCreate(TaskBase):
    pass

class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
```

**Backend implementation checklist:**
- [ ] API endpoints match spec definitions
- [ ] Request/response schemas match spec
- [ ] Database models match schema spec
- [ ] Error handling per spec requirements
- [ ] Validation rules implemented
- [ ] Authentication/authorization applied

### 5. Implement Frontend Components

**For UI specs, create React components:**

Next.js example:
```tsx
// frontend/components/TaskList.tsx
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { useTasks } from '@/hooks/useTasks';

interface TaskListProps {
  tasks: Task[];
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  const { loading, error } = useTasks();

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

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

**For API integration, create service functions:**
```ts
// frontend/lib/api/tasks.ts
import { Task, TaskCreate, TaskUpdate } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}

export async function createTask(task: TaskCreate): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
}

export async function updateTask(id: number, task: TaskUpdate): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}
```

**Frontend implementation checklist:**
- [ ] Components match UI spec designs
- [ ] API calls match endpoint specs
- [ ] State management per requirements
- [ ] Error handling as specified
- [ ] Loading states implemented
- [ ] Accessibility features included

### 6. Validate Implementation Against Specs

**Create validation matrix:**

```bash
# Validate each requirement against implementation
validate_requirement() {
    local req_id=$1
    local req_desc=$2
    local check_command=$3

    echo "Validating: $req_id - $req_desc"

    if eval "$check_command"; then
        echo "✅ $req_id: PASSED"
        return 0
    else
        echo "❌ $req_id: FAILED"
        return 1
    fi
}

# Example validation calls
validate_requirement "REQ-001" "User can add a todo with a title" \
    "python -c 'from backend.main import app; assert hasattr(app, \"add_task\")'"

validate_requirement "REQ-002" "System assigns unique numeric ID" \
    "grep -q 'unique.*id' backend/models/task.py"

validate_requirement "REQ-003" "System returns confirmation message" \
    "grep -q 'return.*confirmation' backend/routes/tasks.py"
```

**Automated testing validation:**
```bash
# Run tests that validate against spec
run_spec_tests() {
    echo "Running spec-compliance tests..."

    # Unit tests
    python -m pytest tests/unit/ -v

    # Integration tests
    python -m pytest tests/integration/ -v

    # API contract tests
    python -m pytest tests/api/ -v
}

# Code quality checks
run_quality_checks() {
    echo "Running code quality checks..."

    # Linting
    flake8 src/
    eslint frontend/ --ext .js,.jsx,.ts,.tsx

    # Type checking
    mypy src/
    tsc --noEmit
}
```

**Validation checklist:**
- [ ] All functional requirements implemented
- [ ] Non-functional requirements met
- [ ] API contracts match specs
- [ ] Database schema matches specs
- [ ] UI components match specs
- [ ] Error handling per specs
- [ ] Performance requirements met
- [ ] Security requirements implemented

### 7. Update Specs When Required

**Identify when specs need updates:**
- Implementation reveals missing requirements
- Technical constraints require spec changes
- User feedback modifies requirements
- Security considerations require changes

**Update process:**
```bash
# Create spec update proposal
create_spec_update() {
    local feature=$1
    local change_reason=$2
    local proposed_change=$3

    cat > "specs/${feature}/spec-updates.md" << EOF
# Spec Update Proposal: ${feature}

## Change Reason
${change_reason}

## Proposed Change
${proposed_change}

## Impact Analysis
- Affected components: [list]
- Required code changes: [list]
- Testing needed: [list]

## Approval Status
- [ ] Domain expert approval
- [ ] Technical lead approval
- [ ] Product owner approval
EOF
}
```

**Spec update checklist:**
- [ ] Document change reason
- [ ] Analyze impact on other components
- [ ] Get necessary approvals
- [ ] Update related specs if needed
- [ ] Update implementation to match new spec
- [ ] Update tests to match new spec

### 8. Generate Compliance Report

**Create detailed compliance report:**

```markdown
# Spec-Driven Development Report: [Feature Name]

## Specification Reference
- **Feature Spec:** specs/features/[feature-name]/spec.md
- **API Spec:** specs/api/[feature-name]/spec.md
- **Database Spec:** specs/database/[feature-name]/spec.md
- **UI Spec:** specs/ui/[feature-name]/spec.md
- **Development Date:** 2025-12-24
- **Developer:** Spec Developer

## Requirements Implementation

### Functional Requirements
- **REQ-001: User can add a todo with a title**
  - **Status:** ✅ IMPLEMENTED
  - **Evidence:** POST /api/tasks endpoint accepts title parameter
  - **Files:** backend/routes/tasks.py, frontend/components/TaskForm.tsx
  - **Tests:** tests/api/test_tasks.py::test_create_task

- **REQ-002: System assigns unique numeric ID**
  - **Status:** ✅ IMPLEMENTED
  - **Evidence:** Database auto-increment primary key
  - **Files:** backend/models/task.py
  - **Tests:** tests/unit/test_models.py::test_task_id_assignment

- **REQ-003: System returns confirmation message**
  - **Status:** ⚠️ PARTIAL
  - **Evidence:** Success response but message format differs
  - **Expected:** "Task created successfully"
  - **Actual:** "Task added to database"
  - **Impact:** LOW (functionality works, message differs)
  - **Recommendation:** Update implementation or spec for consistency

- **REQ-004: Empty title is rejected with error**
  - **Status:** ✅ IMPLEMENTED
  - **Evidence:** Validation in Pydantic model and API endpoint
  - **Files:** backend/models/task.py, backend/routes/tasks.py
  - **Tests:** tests/api/test_tasks.py::test_create_task_empty_title

### Non-Functional Requirements
- **Performance:** ✅ All endpoints respond under 200ms
- **Security:** ✅ Authentication required for protected endpoints
- **Accessibility:** ✅ ARIA attributes implemented per UI spec
- **Scalability:** ⚠️ Not tested at scale

## Spec Compliance Analysis

### Feature Spec Compliance: 95%
- ✅ All major features implemented
- ⚠️ Minor message format differences
- ✅ Error handling per spec
- ✅ Validation rules implemented

### API Spec Compliance: 98%
- ✅ All endpoints match spec
- ✅ Request/response schemas match
- ✅ HTTP status codes correct
- ✅ Error responses per spec

### Database Spec Compliance: 100%
- ✅ All fields match spec
- ✅ Data types correct
- ✅ Constraints implemented
- ✅ Indexes added as specified

### UI Spec Compliance: 92%
- ✅ All components implemented
- ✅ Layout matches spec
- ⚠️ Minor styling differences
- ✅ Interactions per spec

## Cross-Spec Consistency

### API-Database Consistency: ✅ VALID
- ✅ Request schemas match database models
- ✅ Response schemas match database models
- ✅ Validation rules consistent

### Frontend-Backend Consistency: ✅ VALID
- ✅ API calls match backend endpoints
- ✅ Data structures consistent
- ✅ Error handling aligned

### Security Integration: ✅ VALID
- ✅ Authentication applied to protected endpoints
- ✅ Authorization checks implemented
- ✅ Input validation consistent

## Code Quality Assessment

### Backend Quality
- **Test Coverage:** 85% (target: 80%)
- **Code Quality:** A grade (flake8, mypy, bandit)
- **Documentation:** Complete API docs

### Frontend Quality
- **Test Coverage:** 78% (target: 75%)
- **Code Quality:** A grade (eslint, tsc)
- **Performance:** All metrics under threshold

## Recommendations

### Immediate Actions
1. **Update confirmation message format** (LOW priority)
   - Align with spec or update spec for consistency
   - Files: backend/routes/tasks.py

2. **Add performance tests** (MEDIUM priority)
   - Implement load testing for scalability verification
   - Files: tests/performance/

### Future Improvements
1. **Enhance accessibility** (MEDIUM priority)
   - Add more ARIA attributes as needed
   - Conduct accessibility audit

2. **Improve error logging** (LOW priority)
   - Add structured logging for better debugging

## Compliance Summary

### Overall Compliance: 95.5%
- ✅ Functional requirements: 95%
- ✅ API compliance: 98%
- ✅ Database compliance: 100%
- ✅ UI compliance: 92%
- ✅ Security compliance: 100%

### Risk Assessment: LOW
- Minor deviations from spec (non-critical)
- All major functionality working as specified
- Security requirements fully implemented

### Next Steps
- [ ] Address minor spec deviations
- [ ] Run performance tests
- [ ] Conduct user acceptance testing
- [ ] Prepare for code review
```

## Output

**Success case (full spec compliance):**
```
✅ SPEC-DRIVEN DEVELOPMENT COMPLETE: [Feature Name]

📋 Requirements: 20/20 implemented (100%)
✅ Feature Spec: 100% compliance
✅ API Spec: 100% compliance
✅ Database Spec: 100% compliance
✅ UI Spec: 100% compliance
✅ Security: All requirements met

🎯 IMPLEMENTATION MATCHES SPECIFICATION
✅ READY FOR CODE REVIEW

[Link to detailed compliance report]
```

**Partial compliance (minor deviations):**
```
⚠️ SPEC-DRIVEN DEVELOPMENT: [Feature Name]

📋 Requirements: 18/20 implemented, 2/20 minor deviations
✅ Feature Spec: 95% compliance
✅ API Spec: 98% compliance
⚠️ UI Spec: 92% compliance (minor styling differences)
✅ Security: All requirements met

Non-blocking deviations:
1. Confirmation message format differs (LOW priority)
2. Minor UI styling variations (LOW priority)

🎯 CONDITIONAL APPROVAL
✅ Ready for review with documented deviations
📝 Minor spec adjustments needed for consistency

[Link to detailed compliance report]
```

**Failure case (spec violations):**
```
❌ SPEC-DRIVEN DEVELOPMENT FAILED: [Feature Name]

📋 Requirements: 12/20 implemented, 8/20 FAILED
❌ Critical Violations Found:
   1. REQ-004: Empty title validation missing (HIGH)
   2. REQ-007: Security authentication not applied (CRITICAL)
   3. REQ-009: Database constraints not implemented (HIGH)

🚫 SPEC VIOLATIONS PREVENT PROGRESSION

Required fixes:
1. Implement input validation for all endpoints
2. Apply authentication to protected routes
3. Add database constraints as specified
4. Re-validate implementation after fixes

📋 Return to implementation
🔒 Critical spec violations must be fixed

[Link to detailed compliance report]
```

## Failure Handling

### Spec File Not Found
- Check if feature name is correct
- Verify spec exists in `specs/[area]/[feature-name]/spec.md`
- If spec missing: BLOCK and require spec creation
- Cannot implement without specification

### Implementation Not Found
- Check if project structure exists
- Verify expected directories and files
- If implementation missing: Report as incomplete setup
- Cannot validate non-existent implementation

### Spec-Account Mismatch
- Flag any implementation that doesn't match spec
- Document the deviation in compliance report
- Require clarification before proceeding
- Consider updating spec if implementation is superior

### Multiple Spec Conflicts
**If strict_mode = true:**
- FAIL if any specs conflict with each other
- Require spec resolution before implementation

**If strict_mode = false (default):**
- WARN about spec conflicts
- Document how conflicts were resolved
- Recommend spec alignment for consistency

### Missing Spec Areas
- Flag any missing spec areas that should exist
- Document assumptions made without spec guidance
- Recommend creating missing specifications
- Consider as potential requirement gap

## Quality Gates

**PASS (approved for next step):**
- ✅ 100% of critical requirements implemented
- ✅ API spec compliance ≥ 95%
- ✅ Database spec compliance ≥ 95%
- ✅ Security requirements fully met
- ✅ No critical spec violations
- ✅ All major functionality works as specified

**CONDITIONAL PASS (proceed with documentation):**
- ⚠️ ≥90% of requirements implemented
- ⚠️ Minor spec deviations documented
- ⚠️ Non-critical functionality working
- ✅ Security requirements met
- ✅ Can be reviewed with known deviations

**FAIL (blocking, cannot proceed):**
- ❌ <90% of requirements implemented
- ❌ Critical spec violations (security, validation)
- ❌ Missing major functionality
- ❌ API or database spec compliance < 80%
- ❌ Security requirements not met

## Integration with SDD Workflow

**After implementation:**
1. If PASS: Proceed to testing, create PHR (stage: green)
2. If CONDITIONAL: Document deviations, proceed with notes
3. If FAIL: Block progress, create fix tasks, create PHR (stage: red)

**Traceability:**
- Link compliance report to all relevant spec files
- Reference requirement IDs in implementation
- Create tasks for spec violations
- Document decisions in ADR if significant

## Examples

### Example 1: Perfect Compliance
```
Input: "Implement task-crud following spec"

Output:
✅ DEVELOPMENT COMPLETE: task-crud
📋 All 15 requirements implemented (100%)
✅ Feature spec: 100% compliance
✅ API spec: 100% compliance
✅ Database spec: 100% compliance
✅ Security: All auth requirements met

Implemented:
- REQ-001: Create task: ✅
- REQ-002: Read task: ✅
- REQ-003: Update task: ✅
- REQ-004: Delete task: ✅
- REQ-005: List tasks: ✅
- All validation and security: ✅

🎯 READY FOR TESTING
```

### Example 2: Minor Deviations
```
Input: "Implement user-authentication per spec"

Output:
⚠️ DEVELOPMENT: user-authentication
📋 12/15 requirements, 3/15 minor deviations

Compliant:
- REQ-001: User registration: ✅
- REQ-002: User login: ✅
- REQ-003: JWT tokens: ✅
- REQ-004: Password hashing: ✅
- REQ-005: Session management: ✅

Deviations:
- REQ-006: Token expiration differs (15m vs 30m spec)
  Impact: LOW (still secure)
- REQ-007: Error message format (slightly different)
  Impact: LOW (meaning preserved)
- REQ-008: UI styling (colors slightly different)
  Impact: LOW (functionality preserved)

✅ CAN PROCEED with documented deviations
📝 Will align with spec in next iteration
```

### Example 3: Critical Violations
```
Input: "Implement task-api following spec"

Output:
❌ DEVELOPMENT FAILED: task-api
📋 8/15 requirements implemented, 7/15 FAILED

CRITICAL VIOLATIONS:
- REQ-004: No input validation (CRITICAL)
  Evidence: No validation on POST requests
  Impact: CRITICAL (security vulnerability)

- REQ-007: No authentication on protected endpoints (CRITICAL)
  Evidence: API endpoints accessible without auth
  Impact: CRITICAL (security breach)

- REQ-009: Database constraints missing (HIGH)
  Evidence: No unique constraints, no data validation
  Impact: HIGH (data integrity issues)

Partially working:
- Basic CRUD: ✅ (but unsecured)
- API structure: ✅ (but unvalidated)

🚫 BLOCKED: Cannot proceed with security vulnerabilities
📋 Required fixes:
   1. Add input validation to all endpoints
   2. Apply authentication middleware
   3. Add database constraints
   4. Re-validate after fixes
```