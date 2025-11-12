"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Download,
  Plus,
  AlertTriangle,
  Users,
  Grid3x3,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import { AddAssignmentModal } from "@/components/planning/add-assignment-modal";
import { useDatabase } from "@/app/protected/database-context";
import { AssignmentStatus, EmployeeStatus, ProjectStatus } from "@/lib/types";
import type { Employee, Assignment } from "@/lib/types";

// Types
type ViewType = "week" | "month" | "gantt";

// Helper functions
const getAssignmentColor = (status: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.CONFIRMED:
    case AssignmentStatus.IN_PROGRESS:
      return "bg-emerald-500 text-white";
    case AssignmentStatus.SCHEDULED:
      return "bg-amber-500 text-white";
    case AssignmentStatus.DELAYED:
      return "bg-rose-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
};

const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[1][0]}.`;
  }
  return name.substring(0, 2).toUpperCase();
};

const getWeekDays = () => {
  const days = [];
  const current = new Date();
  current.setDate(current.getDate() - current.getDay() + 1); // Start from Monday

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const formatDayHeader = (date: Date) => {
  const days = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return {
    day: days[date.getDay()],
    date: date.getDate(),
    month: months[date.getMonth()],
  };
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getWeekStart = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay() === 0 ? 7 : start.getDay();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day + 1);
  return start;
};

const getWeekEnd = (start: Date) => {
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + 6);
  return end;
};

const formatLongDate = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
};

const getMonthDays = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  // Adjust to start from Monday (0 = Monday, 6 = Sunday)
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Days to display (including days from previous and next month)
  const days: Date[] = [];

  // Add days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the grid (42 days = 6 weeks)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

const formatMonthYear = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

// Draggable Employee Component
function DraggableEmployee({
  employee,
  weeklyHours = 0,
}: {
  employee: Employee;
  weeklyHours?: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `employee-${employee.id}`,
    data: {
      type: "employee",
      employee,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm cursor-grab hover:shadow-md transition border ${
        isDragging ? "opacity-50 border-blue-400" : "border-transparent"
      }`}
    >
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 overflow-hidden">
        {employee.imageUrl ? (
          <img
            src={employee.imageUrl}
            alt={employee.name || "?"}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(employee.name || "?")
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {employee.name || "Sans nom"}
        </div>
        <div className="text-xs text-slate-500 truncate">
          {employee.jobTitle}
        </div>
        <div
          className={`text-xs ${
            weeklyHours >= 35 ? "text-rose-500 font-semibold" : "text-slate-400"
          }`}
        >
          {weeklyHours > 0
            ? `${Math.round(weeklyHours)}h prévues cette semaine`
            : "Aucune heure planifiée cette semaine"}
        </div>
      </div>
      <div
        className={`h-2 w-2 rounded-full ${
          employee.status === EmployeeStatus.AVAILABLE
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />
    </div>
  );
}

// Draggable Assignment Component
function DraggableAssignment({ assignment }: { assignment: Assignment }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `assignment-${assignment.id}`,
    data: {
      type: "assignment",
      assignment,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded px-2 py-1 text-xs font-semibold cursor-move flex items-center justify-center ${getAssignmentColor(
        assignment.status
      )} ${isDragging ? "opacity-50" : ""}`}
      title={`${assignment.employee?.name || "?"} - ${
        assignment.role || "Pas de rôle"
      }`}
    >
      {assignment.employee?.imageUrl ? (
        <img
          src={assignment.employee.imageUrl}
          alt={assignment.employee.name || "?"}
          className="h-5 w-5 rounded-full object-cover"
        />
      ) : (
        getInitials(assignment.employee?.name || "?")
      )}
    </div>
  );
}

// Droppable Cell Component
function DroppableCell({
  projectId,
  day,
  children,
  onAddClick,
}: {
  projectId: string;
  day: Date;
  children: React.ReactNode;
  onAddClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${projectId}-${day.toISOString()}`,
    data: {
      type: "cell",
      projectId,
      date: day,
    },
  });

  const isToday = isSameDay(day, new Date());

  return (
    <div
      ref={setNodeRef}
      className={`w-32 flex-shrink-0 border-r border-slate-200 p-2 transition-colors ${
        isToday ? "bg-blue-50/50" : ""
      } ${isOver ? "bg-emerald-50 ring-2 ring-emerald-400 ring-inset" : ""}`}
    >
      <div className="flex flex-wrap gap-1">
        {children}
        <button
          onClick={onAddClick}
          className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          title="Ajouter une affectation"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function UnassignDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassign-zone",
    data: {
      type: "unassign",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-64 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto transition-colors ${
        isOver ? "bg-emerald-50 ring-2 ring-emerald-400 ring-inset" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Droppable Month Day Cell Component
function DroppableMonthDayCell({
  day,
  assignments,
  isCurrentMonth,
  onAddClick,
}: {
  day: Date;
  assignments: Assignment[];
  isCurrentMonth: boolean;
  onAddClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `month-cell-${day.toISOString()}`,
    data: {
      type: "month-cell",
      date: day,
    },
  });

  const isToday = isSameDay(day, new Date());

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] border border-slate-200 p-2 transition-colors ${
        !isCurrentMonth ? "bg-slate-50" : "bg-white"
      } ${isToday ? "ring-2 ring-blue-400 ring-inset" : ""} ${
        isOver ? "bg-emerald-50 ring-2 ring-emerald-400 ring-inset" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-semibold ${
            isToday
              ? "text-blue-600"
              : !isCurrentMonth
              ? "text-slate-400"
              : "text-slate-700"
          }`}
        >
          {day.getDate()}
        </span>
        <button
          onClick={onAddClick}
          className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
          title="Ajouter une affectation"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-1 max-h-[80px] overflow-y-auto">
        {assignments.map((assignment) => (
          <DraggableAssignment key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}

export default function PlanningPage() {
  const {
    assignments,
    employees,
    projects,
    fetchAssignments,
    fetchEmployees,
    fetchProjects,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useDatabase();

  const [currentView, setCurrentView] = useState<ViewType>("week");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weekDays] = useState<Date[]>(getWeekDays());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null
  );

  const { startOfDisplayedWeek, endOfDisplayedWeek } = useMemo(() => {
    const reference = weekDays[0] ?? getWeekStart(new Date());
    const start = getWeekStart(reference);
    return {
      startOfDisplayedWeek: start,
      endOfDisplayedWeek: getWeekEnd(start),
    };
  }, [weekDays]);

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
    fetchProjects();
  }, [fetchAssignments, fetchEmployees, fetchProjects]);

  // Calculate stats
  const activeProjects = projects.data.filter(
    (p) =>
      p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.PLANNING
  );

  const assignedEmployeeIds = new Set(
    assignments.data.map((a) => a.employeeId)
  );

  const weeklyAssignmentsByEmployee = useMemo(() => {
    const accumulator: Record<string, { hours: number }> = {};

    assignments.data.forEach((assignment) => {
      const assignmentDate = new Date(assignment.startDate);
      if (
        assignmentDate >= startOfDisplayedWeek &&
        assignmentDate <= endOfDisplayedWeek
      ) {
        const plannedHours = Number(assignment.plannedHours ?? 8);
        const existing = accumulator[assignment.employeeId] ?? { hours: 0 };
        existing.hours += plannedHours;
        accumulator[assignment.employeeId] = existing;
      }
    });

    return accumulator;
  }, [assignments.data, startOfDisplayedWeek, endOfDisplayedWeek]);

  const assignedEmployees = employees.data.filter((e) =>
    assignedEmployeeIds.has(e.id)
  );

  const plannableEmployees = employees.data.filter(
    (e) =>
      e.status !== EmployeeStatus.TERMINATED &&
      e.status !== EmployeeStatus.ABSENT
  );

  const assignedEmployeeIdsThisWeek = new Set(
    Object.keys(weeklyAssignmentsByEmployee)
  );

  const nonAssignedThisWeekCount = plannableEmployees.filter(
    (e) => !assignedEmployeeIdsThisWeek.has(e.id)
  ).length;

  const occupancyRate =
    employees.data.length > 0
      ? Math.round((assignedEmployees.length / employees.data.length) * 100)
      : 0;

  const conflictsCount = 0; // TODO: Calculate conflicts

  // Get assignments by project and day
  const getAssignmentsForProjectAndDay = (projectId: string, day: Date) => {
    return assignments.data.filter((assignment) => {
      if (assignment.projectId !== projectId) return false;
      const assignmentDate = new Date(assignment.startDate);
      return isSameDay(assignmentDate, day);
    });
  };

  const handleAddAssignment = (projectId: string, day: Date) => {
    setSelectedProjectId(projectId);
    setSelectedDate(day.toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "employee") {
      setActiveEmployee(active.data.current.employee);
      setActiveAssignment(null);
    } else if (active.data.current?.type === "assignment") {
      setActiveAssignment(active.data.current.assignment);
      setActiveEmployee(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEmployee(null);
    setActiveAssignment(null);

    if (!over) return;

    const draggedData = active.data.current;
    const cellData = over.data.current;

    const WEEKLY_HOURS_LIMIT = 35;
    const DEFAULT_ASSIGNMENT_HOURS = 8;

    const getEmployeeById = (employeeId: string) =>
      employees.data.find((employee) => employee.id === employeeId) || null;

    const validateAssignment = (
      employee: Employee,
      targetDate: Date,
      hoursToAdd: number,
      options?: { excludeAssignmentId?: string }
    ) => {
      const weekStart = getWeekStart(targetDate);
      const weekEnd = getWeekEnd(weekStart);

      let weeklyHours = 0;
      const sameDayConflicts: Assignment[] = [];

      assignments.data.forEach((assignment) => {
        if (assignment.employeeId !== employee.id) return;
        if (
          options?.excludeAssignmentId &&
          assignment.id === options.excludeAssignmentId
        )
          return;

        const assignmentDate = new Date(assignment.startDate);

        if (assignmentDate >= weekStart && assignmentDate <= weekEnd) {
          weeklyHours += Number(
            assignment.plannedHours ?? DEFAULT_ASSIGNMENT_HOURS
          );
        }

        if (isSameDay(assignmentDate, targetDate)) {
          sameDayConflicts.push(assignment);
        }
      });

      const projectedHours = weeklyHours + hoursToAdd;

      if (projectedHours > WEEKLY_HOURS_LIMIT) {
        const proceed = window.confirm(
          `Cet employé a déjà ${weeklyHours}h planifiées cette semaine. Ajouter cette affectation porterait la charge à ${projectedHours}h. Voulez-vous continuer ?`
        );

        if (!proceed) {
          return false;
        }
      }

      if (sameDayConflicts.length > 0) {
        const conflictProjects = sameDayConflicts
          .map(
            (conflict) =>
              projects.data.find((project) => project.id === conflict.projectId)
                ?.name || "Chantier"
          )
          .join(", ");

        const dateLabel = formatLongDate(targetDate);
        const proceed = window.confirm(
          `Cet employé est déjà planifié le ${dateLabel} sur ${conflictProjects}. Voulez-vous ajouter une autre affectation ?`
        );

        if (!proceed) {
          return false;
        }
      }

      const cautionStatuses = [
        EmployeeStatus.ON_LEAVE,
        EmployeeStatus.SICK_LEAVE,
        EmployeeStatus.IN_TRAINING,
      ];

      if (cautionStatuses.includes(employee.status)) {
        const statusLabels: Record<EmployeeStatus, string> = {
          [EmployeeStatus.AVAILABLE]: "disponible",
          [EmployeeStatus.ON_MISSION]: "en mission",
          [EmployeeStatus.IN_TRAINING]: "en formation",
          [EmployeeStatus.ON_LEAVE]: "en congé",
          [EmployeeStatus.SICK_LEAVE]: "en arrêt maladie",
          [EmployeeStatus.ABSENT]: "absent",
          [EmployeeStatus.TERMINATED]: "sorti de l'entreprise",
        };

        const proceed = window.confirm(
          `Attention : cet employé est actuellement ${
            statusLabels[employee.status]
          }. Confirmez-vous l'affectation ?`
        );

        if (!proceed) {
          return false;
        }
      }

      if (employee.availableFrom) {
        const availabilityDate = new Date(employee.availableFrom);
        availabilityDate.setHours(0, 0, 0, 0);

        if (targetDate < availabilityDate) {
          const formattedAvailableDate = formatLongDate(availabilityDate);
          const proceed = window.confirm(
            `Cet employé n'est disponible qu'à partir du ${formattedAvailableDate}. Voulez-vous tout de même poursuivre ?`
          );

          if (!proceed) {
            return false;
          }
        }
      }

      return true;
    };

    try {
      // Case 1: Dragging an employee from sidebar
      if (draggedData?.type === "employee") {
        // Handle month view cells
        if (cellData?.type === "month-cell") {
          const date = cellData.date;
          const employee = draggedData.employee;

          // For month view, we need to select a project
          // Open modal with pre-filled date
          setSelectedDate(date.toISOString().split("T")[0]);
          setIsModalOpen(true);
          return;
        }

        if (!cellData || cellData.type !== "cell") return;
        const projectId = cellData.projectId;
        const date = cellData.date;

        const employee = draggedData.employee;

        const canProceed = validateAssignment(
          employee,
          date,
          DEFAULT_ASSIGNMENT_HOURS
        );
        if (!canProceed) {
          return;
        }

        await createAssignment({
          employeeId: employee.id,
          projectId: projectId,
          startDate: date,
          endDate: null,
          status: AssignmentStatus.SCHEDULED,
          role: employee.jobTitle,
          plannedHours: 8,
          notes: `Affecté par glisser-déposer`,
        });
      }
      // Case 2: Dragging an existing assignment
      else if (draggedData?.type === "assignment") {
        const assignment = draggedData.assignment;

        if (!cellData) return;

        // Handle month view cells
        if (cellData.type === "month-cell") {
          const date = cellData.date;

          const employee =
            assignment.employee || getEmployeeById(assignment.employeeId);

          if (!employee) {
            throw new Error("Employé introuvable pour cette affectation.");
          }

          const assignmentHours = Number(
            assignment.plannedHours ?? DEFAULT_ASSIGNMENT_HOURS
          );

          const canProceed = validateAssignment(employee, date, assignmentHours, {
            excludeAssignmentId: assignment.id,
          });

          if (!canProceed) {
            return;
          }

          // Keep the same project, just change the date
          await updateAssignment(assignment.id, {
            startDate: date,
            notes: assignment.notes
              ? `${
                  assignment.notes
                } | Déplacé le ${new Date().toLocaleDateString("fr-FR")}`
              : `Déplacé le ${new Date().toLocaleDateString("fr-FR")}`,
          });

          await fetchAssignments();
          return;
        }

        if (cellData.type === "cell") {
          const projectId = cellData.projectId;
          const date = cellData.date;

          const employee =
            assignment.employee || getEmployeeById(assignment.employeeId);

          if (!employee) {
            throw new Error("Employé introuvable pour cette affectation.");
          }

          const assignmentHours = Number(
            assignment.plannedHours ?? DEFAULT_ASSIGNMENT_HOURS
          );

          const canProceed = validateAssignment(
            employee,
            date,
            assignmentHours,
            {
              excludeAssignmentId: assignment.id,
            }
          );

          if (!canProceed) {
            return;
          }

          await updateAssignment(assignment.id, {
            projectId: projectId,
            startDate: date,
            notes: assignment.notes
              ? `${
                  assignment.notes
                } | Déplacé le ${new Date().toLocaleDateString("fr-FR")}`
              : `Déplacé le ${new Date().toLocaleDateString("fr-FR")}`,
          });
        } else if (cellData.type === "unassign") {
          await deleteAssignment(assignment.id);
          return;
        }
      }

      // Refresh assignments in both cases
      await fetchAssignments();
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      alert("Erreur lors du déplacement");
    }
  };

  if (employees.loading || projects.loading || assignments.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-slate-600">
            Chargement du planning...
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AddAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preSelectedProjectId={selectedProjectId}
        preSelectedDate={selectedDate}
      />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Planning des équipes
              </h1>
              <p className="text-sm text-slate-600">
                {currentView === "week" && "Vue Semaine - Glissez-déposez les employés pour les affecter"}
                {currentView === "month" && "Vue Calendrier - Vue mensuelle des affectations"}
                {currentView === "gantt" && "Vue Gantt - Chronologie des projets"}
              </p>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setCurrentView("week")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  currentView === "week"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                Semaine
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  currentView === "month"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Mois
              </button>
              <button
                onClick={() => setCurrentView("gantt")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  currentView === "gantt"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Gantt
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nouvelle affectation
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600">
              <Download className="h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      {currentView === "week" && (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Personnel disponible */}
          <UnassignDropZone>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Personnel planifiable
            </h3>
            <input
              type="text"
              placeholder="Rechercher un employé..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mb-3 text-xs text-slate-500 font-medium uppercase">
            Non affectés cette semaine ({nonAssignedThisWeekCount})
          </div>

          <div className="space-y-2">
            {plannableEmployees.map((employee) => {
              const weeklyLoad = weeklyAssignmentsByEmployee[employee.id];
              return (
                <DraggableEmployee
                  key={employee.id}
                  employee={employee}
                  weeklyHours={weeklyLoad?.hours ?? 0}
                />
              );
            })}
          </div>
        </UnassignDropZone>

        {/* Planning grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Header with days */}
            <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white">
              <div className="w-48 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  CHANTIER
                </div>
              </div>
              {weekDays.map((day, index) => {
                const header = formatDayHeader(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={index}
                    className={`w-32 flex-shrink-0 border-r border-slate-200 p-2 text-center ${
                      isToday ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase ${
                        isToday ? "text-blue-600" : "text-slate-600"
                      }`}
                    >
                      {header.day} {header.date}
                    </div>
                    <div className="text-xs text-slate-500">{header.month}</div>
                  </div>
                );
              })}
            </div>

            {/* Rows - Projects */}
            {activeProjects.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  Aucun chantier actif. Créez un projet pour commencer.
                </p>
              </div>
            ) : (
              activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex border-b border-slate-200 hover:bg-slate-50"
                >
                  {/* Project name cell */}
                  <div className="w-48 flex-shrink-0 border-r border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {project.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.city || "Non spécifié"}
                    </div>
                  </div>

                  {/* Day cells with assignments */}
                  {weekDays.map((day, dayIndex) => {
                    const dayAssignments = getAssignmentsForProjectAndDay(
                      project.id,
                      day
                    );

                    return (
                      <DroppableCell
                        key={dayIndex}
                        projectId={project.id}
                        day={day}
                        onAddClick={() => handleAddAssignment(project.id, day)}
                      >
                        {dayAssignments.map((assignment) => (
                          <DraggableAssignment
                            key={assignment.id}
                            assignment={assignment}
                          />
                        ))}
                      </DroppableCell>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      )}

      {/* Month View */}
      {currentView === "month" && (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Personnel disponible */}
          <UnassignDropZone>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Personnel planifiable
              </h3>
              <input
                type="text"
                placeholder="Rechercher un employé..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="mb-3 text-xs text-slate-500 font-medium uppercase">
              Non affectés cette semaine ({nonAssignedThisWeekCount})
            </div>

            <div className="space-y-2">
              {plannableEmployees.map((employee) => {
                const weeklyLoad = weeklyAssignmentsByEmployee[employee.id];
                return (
                  <DraggableEmployee
                    key={employee.id}
                    employee={employee}
                    weeklyHours={weeklyLoad?.hours ?? 0}
                  />
                );
              })}
            </div>
          </UnassignDropZone>

          {/* Month calendar content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 capitalize">
                  {formatMonthYear(currentMonth)}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Week days header */}
                <div className="grid grid-cols-7 bg-slate-50">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-xs font-semibold text-slate-600 uppercase border-r border-slate-200 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {getMonthDays(currentMonth).map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const dayAssignments = assignments.data.filter((assignment) => {
                      const assignmentDate = new Date(assignment.startDate);
                      return isSameDay(assignmentDate, day);
                    });

                    return (
                      <DroppableMonthDayCell
                        key={index}
                        day={day}
                        assignments={dayAssignments}
                        isCurrentMonth={isCurrentMonth}
                        onAddClick={() => {
                          setSelectedDate(day.toISOString().split("T")[0]);
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gantt View */}
      {currentView === "gantt" && (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Gantt content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Gantt navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Diagramme de Gantt - Par Projet
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Gantt chart */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Timeline header */}
                <div className="flex border-b border-slate-200">
                  <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      Projet
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex min-w-max">
                      {getMonthDays(currentMonth)
                        .filter((day) => day.getMonth() === currentMonth.getMonth())
                        .map((day, index) => {
                          const isToday = isSameDay(day, new Date());
                          return (
                            <div
                              key={index}
                              className={`w-12 flex-shrink-0 border-r border-slate-200 p-2 text-center ${
                                isToday ? "bg-blue-50" : ""
                              }`}
                            >
                              <div
                                className={`text-xs font-semibold ${
                                  isToday ? "text-blue-600" : "text-slate-600"
                                }`}
                              >
                                {day.getDate()}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Project rows */}
                {activeProjects.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-500">
                      Aucun projet actif. Créez un projet pour commencer.
                    </p>
                  </div>
                ) : (
                  activeProjects.map((project) => {
                    const projectAssignments = assignments.data.filter(
                      (a) => a.projectId === project.id
                    );

                    const monthDays = getMonthDays(currentMonth).filter(
                      (day) => day.getMonth() === currentMonth.getMonth()
                    );

                    return (
                      <div
                        key={project.id}
                        className="flex border-b border-slate-200 hover:bg-slate-50"
                      >
                        {/* Project name */}
                        <div className="w-64 flex-shrink-0 border-r border-slate-200 p-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {projectAssignments.length} affectation
                            {projectAssignments.length > 1 ? "s" : ""}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-x-auto">
                          <div className="flex min-w-max relative h-16 items-center">
                            {monthDays.map((day, dayIndex) => {
                              const isToday = isSameDay(day, new Date());
                              return (
                                <div
                                  key={dayIndex}
                                  className={`w-12 flex-shrink-0 border-r border-slate-200 h-full ${
                                    isToday ? "bg-blue-50/50" : ""
                                  }`}
                                />
                              );
                            })}

                            {/* Assignment bars */}
                            {projectAssignments.map((assignment) => {
                              const assignmentDate = new Date(assignment.startDate);

                              // Find position in the month
                              const dayIndex = monthDays.findIndex((day) =>
                                isSameDay(day, assignmentDate)
                              );

                              if (dayIndex === -1) return null;

                              // Calculate position
                              const left = dayIndex * 48; // 48px = w-12
                              const width = 48; // Single day width

                              return (
                                <div
                                  key={assignment.id}
                                  className={`absolute h-8 rounded px-2 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:opacity-90 transition ${getAssignmentColor(
                                    assignment.status
                                  )}`}
                                  style={{
                                    left: `${left}px`,
                                    width: `${width}px`,
                                  }}
                                  title={`${assignment.employee?.name || "?"} - ${
                                    assignment.role || "Pas de rôle"
                                  }`}
                                >
                                  {assignment.employee?.imageUrl ? (
                                    <img
                                      src={assignment.employee.imageUrl}
                                      alt={assignment.employee.name || "?"}
                                      className="h-5 w-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px]">
                                      {getInitials(assignment.employee?.name || "?")}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom stats */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {activeProjects.length}
              </div>
              <div className="text-xs text-slate-500">Projets planifiés</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {assignedEmployees.length}
              </div>
              <div className="text-xs text-slate-500">Employés affectés</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {occupancyRate}%
              </div>
              <div className="text-xs text-slate-500">Taux d'occupation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {conflictsCount}
              </div>
              <div className="text-xs text-slate-500">Alertes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay - Shows the dragged employee or assignment */}
      <DragOverlay>
        {activeEmployee ? (
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg border-2 border-blue-500">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 overflow-hidden">
              {activeEmployee.imageUrl ? (
                <img
                  src={activeEmployee.imageUrl}
                  alt={activeEmployee.name || "?"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(activeEmployee.name || "?")
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {activeEmployee.name || "Sans nom"}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {activeEmployee.jobTitle}
              </div>
            </div>
          </div>
        ) : activeAssignment ? (
          <div
            className={`rounded px-3 py-2 text-sm font-semibold shadow-lg border-2 border-blue-500 flex items-center justify-center ${getAssignmentColor(
              activeAssignment.status
            )}`}
          >
            {activeAssignment.employee?.imageUrl ? (
              <img
                src={activeAssignment.employee.imageUrl}
                alt={activeAssignment.employee.name || "?"}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              getInitials(activeAssignment.employee?.name || "?")
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
