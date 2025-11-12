"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Activity,
  Alert,
  Assignment,
  Department,
  Document,
  Employee,
  EmployeeCertification,
  EmployeeSkill,
  Evaluation,
  Milestone,
  Project,
  TrainingEnrollment,
  TrainingSession,
} from "@/lib/types";

type Fetcher<T> = () => Promise<T>;
type MutationPayload = Record<string, unknown>;

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface MutationState {
  loading: boolean;
  error: string | null;
}

interface DatabaseContextValue {
  employees: FetchState<Employee[]>;
  departments: FetchState<Department[]>;
  projects: FetchState<Project[]>;
  assignments: FetchState<Assignment[]>;
  milestones: FetchState<Milestone[]>;
  documents: FetchState<Document[]>;
  activities: FetchState<Activity[]>;
  alerts: FetchState<Alert[]>;
  trainingSessions: FetchState<TrainingSession[]>;
  trainingEnrollments: FetchState<TrainingEnrollment[]>;
  certifications: FetchState<EmployeeCertification[]>;
  skills: FetchState<EmployeeSkill[]>;

  employeeMutation: MutationState;
  departmentMutation: MutationState;
  projectMutation: MutationState;
  assignmentMutation: MutationState;
  milestoneMutation: MutationState;
  documentMutation: MutationState;
  activityMutation: MutationState;
  alertMutation: MutationState;
  trainingSessionMutation: MutationState;
  trainingEnrollmentMutation: MutationState;
  certificationMutation: MutationState;
  skillMutation: MutationState;

  fetchEmployees: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchMilestones: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchTrainingSessions: () => Promise<void>;
  fetchTrainingEnrollments: () => Promise<void>;
  fetchCertifications: () => Promise<void>;
  fetchSkills: () => Promise<void>;

  createEmployee: (payload: MutationPayload) => Promise<Employee>;
  updateEmployee: (id: string, payload: MutationPayload) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;

  createDepartment: (payload: MutationPayload) => Promise<Department>;
  updateDepartment: (
    id: string,
    payload: MutationPayload
  ) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<void>;

  createProject: (payload: MutationPayload) => Promise<Project>;
  updateProject: (id: string, payload: MutationPayload) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  createAssignment: (payload: MutationPayload) => Promise<Assignment>;
  updateAssignment: (
    id: string,
    payload: MutationPayload
  ) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;

  createMilestone: (payload: MutationPayload) => Promise<Milestone>;
  updateMilestone: (id: string, payload: MutationPayload) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;

  createDocument: (payload: MutationPayload) => Promise<Document>;
  updateDocument: (id: string, payload: MutationPayload) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;

  createActivity: (payload: MutationPayload) => Promise<Activity>;
  updateActivity: (id: string, payload: MutationPayload) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;

  createAlert: (payload: MutationPayload) => Promise<Alert>;
  updateAlert: (id: string, payload: MutationPayload) => Promise<Alert>;
  deleteAlert: (id: string) => Promise<void>;

  createTrainingSession: (payload: MutationPayload) => Promise<TrainingSession>;
  updateTrainingSession: (
    id: string,
    payload: MutationPayload
  ) => Promise<TrainingSession>;
  deleteTrainingSession: (id: string) => Promise<void>;

  createTrainingEnrollment: (
    payload: MutationPayload
  ) => Promise<TrainingEnrollment>;
  updateTrainingEnrollment: (
    id: string,
    payload: MutationPayload
  ) => Promise<TrainingEnrollment>;
  deleteTrainingEnrollment: (id: string) => Promise<void>;

  createCertification: (
    payload: MutationPayload
  ) => Promise<EmployeeCertification>;
  updateCertification: (
    id: string,
    payload: MutationPayload
  ) => Promise<EmployeeCertification>;
  deleteCertification: (id: string) => Promise<void>;

  createSkill: (payload: MutationPayload) => Promise<EmployeeSkill>;
  updateSkill: (id: string, payload: MutationPayload) => Promise<EmployeeSkill>;
  deleteSkill: (id: string) => Promise<void>;
}

const DEFAULT_STATE: FetchState<unknown> = {
  data: [],
  loading: false,
  error: null,
};

const DEFAULT_MUTATION: MutationState = {
  loading: false,
  error: null,
};

const DatabaseContext = createContext<DatabaseContextValue | undefined>(
  undefined
);

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erreur lors de la requête ${path}`);
  }

  return (await response.json()) as T;
}

async function apiMutation<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: MutationPayload
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erreur lors de la requête ${method} ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function useFetchState<T>(initialData: T, fetcher: Fetcher<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      }));
    }
  }, [fetcher]);

  return { state, load };
}

function useMutationState() {
  const [state, setState] = useState<MutationState>(DEFAULT_MUTATION);

  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setState({ loading: true, error: null });
    try {
      const result = await task();
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      });
      throw error;
    }
  }, []);

  return { state, run };
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { state: employees, load: fetchEmployees } = useFetchState<Employee[]>(
    [],
    useCallback(() => apiFetch<Employee[]>("/api/employees"), [])
  );

  const { state: departments, load: fetchDepartments } = useFetchState<
    Department[]
  >(
    [],
    useCallback(() => apiFetch<Department[]>("/api/departments"), [])
  );

  const { state: projects, load: fetchProjects } = useFetchState<Project[]>(
    [],
    useCallback(() => apiFetch<Project[]>("/api/projects"), [])
  );

  const { state: assignments, load: fetchAssignments } = useFetchState<
    Assignment[]
  >(
    [],
    useCallback(() => apiFetch<Assignment[]>("/api/assignments"), [])
  );

  const { state: milestones, load: fetchMilestones } = useFetchState<
    Milestone[]
  >(
    [],
    useCallback(() => apiFetch<Milestone[]>("/api/milestones"), [])
  );

  const { state: documents, load: fetchDocuments } = useFetchState<Document[]>(
    [],
    useCallback(() => apiFetch<Document[]>("/api/documents"), [])
  );

  const { state: activities, load: fetchActivities } = useFetchState<
    Activity[]
  >(
    [],
    useCallback(() => apiFetch<Activity[]>("/api/activities"), [])
  );

  const { state: alerts, load: fetchAlerts } = useFetchState<Alert[]>(
    [],
    useCallback(() => apiFetch<Alert[]>("/api/alerts"), [])
  );

  const { state: trainingSessions, load: fetchTrainingSessions } =
    useFetchState<TrainingSession[]>(
      [],
      useCallback(
        () => apiFetch<TrainingSession[]>("/api/trainings/sessions"),
        []
      )
    );

  const { state: trainingEnrollments, load: fetchTrainingEnrollments } =
    useFetchState<TrainingEnrollment[]>(
      [],
      useCallback(
        () => apiFetch<TrainingEnrollment[]>("/api/trainings/enrollments"),
        []
      )
    );

  const { state: certifications, load: fetchCertifications } = useFetchState<
    EmployeeCertification[]
  >(
    [],
    useCallback(
      () => apiFetch<EmployeeCertification[]>("/api/employees/certifications"),
      []
    )
  );

  const { state: skills, load: fetchSkills } = useFetchState<EmployeeSkill[]>(
    [],
    useCallback(() => apiFetch<EmployeeSkill[]>("/api/employees/skills"), [])
  );

  const { state: employeeMutation, run: runEmployeeMutation } =
    useMutationState();
  const { state: departmentMutation, run: runDepartmentMutation } =
    useMutationState();
  const { state: projectMutation, run: runProjectMutation } =
    useMutationState();
  const { state: assignmentMutation, run: runAssignmentMutation } =
    useMutationState();
  const { state: milestoneMutation, run: runMilestoneMutation } =
    useMutationState();
  const { state: documentMutation, run: runDocumentMutation } =
    useMutationState();
  const { state: activityMutation, run: runActivityMutation } =
    useMutationState();
  const { state: alertMutation, run: runAlertMutation } = useMutationState();
  const { state: trainingSessionMutation, run: runTrainingSessionMutation } =
    useMutationState();
  const {
    state: trainingEnrollmentMutation,
    run: runTrainingEnrollmentMutation,
  } = useMutationState();
  const { state: certificationMutation, run: runCertificationMutation } =
    useMutationState();
  const { state: skillMutation, run: runSkillMutation } = useMutationState();

  const createEmployee = useCallback(
    async (payload: MutationPayload) =>
      runEmployeeMutation(async () => {
        const created = await apiMutation<Employee>(
          "/api/employees",
          "POST",
          payload
        );
        await fetchEmployees();
        return created;
      }),
    [fetchEmployees, runEmployeeMutation]
  );

  const updateEmployee = useCallback(
    async (id: string, payload: MutationPayload) =>
      runEmployeeMutation(async () => {
        const updated = await apiMutation<Employee>(
          `/api/employees/${id}`,
          "PATCH",
          payload
        );
        await fetchEmployees();
        return updated;
      }),
    [fetchEmployees, runEmployeeMutation]
  );

  const deleteEmployee = useCallback(
    async (id: string) =>
      runEmployeeMutation(async () => {
        await apiMutation<undefined>(`/api/employees/${id}`, "DELETE");
        await fetchEmployees();
      }),
    [fetchEmployees, runEmployeeMutation]
  );

  const createDepartment = useCallback(
    async (payload: MutationPayload) =>
      runDepartmentMutation(async () => {
        const created = await apiMutation<Department>(
          "/api/departments",
          "POST",
          payload
        );
        await fetchDepartments();
        return created;
      }),
    [fetchDepartments, runDepartmentMutation]
  );

  const updateDepartment = useCallback(
    async (id: string, payload: MutationPayload) =>
      runDepartmentMutation(async () => {
        const updated = await apiMutation<Department>(
          `/api/departments/${id}`,
          "PATCH",
          payload
        );
        await fetchDepartments();
        return updated;
      }),
    [fetchDepartments, runDepartmentMutation]
  );

  const deleteDepartment = useCallback(
    async (id: string) =>
      runDepartmentMutation(async () => {
        await apiMutation<undefined>(`/api/departments/${id}`, "DELETE");
        await fetchDepartments();
      }),
    [fetchDepartments, runDepartmentMutation]
  );

  const createProject = useCallback(
    async (payload: MutationPayload) =>
      runProjectMutation(async () => {
        const created = await apiMutation<Project>(
          "/api/projects",
          "POST",
          payload
        );
        await fetchProjects();
        return created;
      }),
    [fetchProjects, runProjectMutation]
  );

  const updateProject = useCallback(
    async (id: string, payload: MutationPayload) =>
      runProjectMutation(async () => {
        const updated = await apiMutation<Project>(
          `/api/projects/${id}`,
          "PATCH",
          payload
        );
        await fetchProjects();
        return updated;
      }),
    [fetchProjects, runProjectMutation]
  );

  const deleteProject = useCallback(
    async (id: string) =>
      runProjectMutation(async () => {
        await apiMutation<undefined>(`/api/projects/${id}`, "DELETE");
        await fetchProjects();
      }),
    [fetchProjects, runProjectMutation]
  );

  const createAssignment = useCallback(
    async (payload: MutationPayload) =>
      runAssignmentMutation(async () => {
        const created = await apiMutation<Assignment>(
          "/api/assignments",
          "POST",
          payload
        );
        await fetchAssignments();
        return created;
      }),
    [fetchAssignments, runAssignmentMutation]
  );

  const updateAssignment = useCallback(
    async (id: string, payload: MutationPayload) =>
      runAssignmentMutation(async () => {
        const updated = await apiMutation<Assignment>(
          `/api/assignments/${id}`,
          "PATCH",
          payload
        );
        await fetchAssignments();
        return updated;
      }),
    [fetchAssignments, runAssignmentMutation]
  );

  const deleteAssignment = useCallback(
    async (id: string) =>
      runAssignmentMutation(async () => {
        await apiMutation<undefined>(`/api/assignments/${id}`, "DELETE");
        await fetchAssignments();
      }),
    [fetchAssignments, runAssignmentMutation]
  );

  const createMilestone = useCallback(
    async (payload: MutationPayload) =>
      runMilestoneMutation(async () => {
        const created = await apiMutation<Milestone>(
          "/api/milestones",
          "POST",
          payload
        );
        await fetchMilestones();
        return created;
      }),
    [fetchMilestones, runMilestoneMutation]
  );

  const updateMilestone = useCallback(
    async (id: string, payload: MutationPayload) =>
      runMilestoneMutation(async () => {
        const updated = await apiMutation<Milestone>(
          `/api/milestones/${id}`,
          "PATCH",
          payload
        );
        await fetchMilestones();
        return updated;
      }),
    [fetchMilestones, runMilestoneMutation]
  );

  const deleteMilestone = useCallback(
    async (id: string) =>
      runMilestoneMutation(async () => {
        await apiMutation<undefined>(`/api/milestones/${id}`, "DELETE");
        await fetchMilestones();
      }),
    [fetchMilestones, runMilestoneMutation]
  );

  const createDocument = useCallback(
    async (payload: MutationPayload) =>
      runDocumentMutation(async () => {
        const created = await apiMutation<Document>(
          "/api/documents",
          "POST",
          payload
        );
        await fetchDocuments();
        return created;
      }),
    [fetchDocuments, runDocumentMutation]
  );

  const updateDocument = useCallback(
    async (id: string, payload: MutationPayload) =>
      runDocumentMutation(async () => {
        const updated = await apiMutation<Document>(
          `/api/documents/${id}`,
          "PATCH",
          payload
        );
        await fetchDocuments();
        return updated;
      }),
    [fetchDocuments, runDocumentMutation]
  );

  const deleteDocument = useCallback(
    async (id: string) =>
      runDocumentMutation(async () => {
        await apiMutation<undefined>(`/api/documents/${id}`, "DELETE");
        await fetchDocuments();
      }),
    [fetchDocuments, runDocumentMutation]
  );

  const createActivity = useCallback(
    async (payload: MutationPayload) =>
      runActivityMutation(async () => {
        const created = await apiMutation<Activity>(
          "/api/activities",
          "POST",
          payload
        );
        await fetchActivities();
        return created;
      }),
    [fetchActivities, runActivityMutation]
  );

  const updateActivity = useCallback(
    async (id: string, payload: MutationPayload) =>
      runActivityMutation(async () => {
        const updated = await apiMutation<Activity>(
          `/api/activities/${id}`,
          "PATCH",
          payload
        );
        await fetchActivities();
        return updated;
      }),
    [fetchActivities, runActivityMutation]
  );

  const deleteActivity = useCallback(
    async (id: string) =>
      runActivityMutation(async () => {
        await apiMutation<undefined>(`/api/activities/${id}`, "DELETE");
        await fetchActivities();
      }),
    [fetchActivities, runActivityMutation]
  );

  const createAlert = useCallback(
    async (payload: MutationPayload) =>
      runAlertMutation(async () => {
        const created = await apiMutation<Alert>(
          "/api/alerts",
          "POST",
          payload
        );
        await fetchAlerts();
        return created;
      }),
    [fetchAlerts, runAlertMutation]
  );

  const updateAlert = useCallback(
    async (id: string, payload: MutationPayload) =>
      runAlertMutation(async () => {
        const updated = await apiMutation<Alert>(
          `/api/alerts/${id}`,
          "PATCH",
          payload
        );
        await fetchAlerts();
        return updated;
      }),
    [fetchAlerts, runAlertMutation]
  );

  const deleteAlert = useCallback(
    async (id: string) =>
      runAlertMutation(async () => {
        await apiMutation<undefined>(`/api/alerts/${id}`, "DELETE");
        await fetchAlerts();
      }),
    [fetchAlerts, runAlertMutation]
  );

  const createTrainingSession = useCallback(
    async (payload: MutationPayload) =>
      runTrainingSessionMutation(async () => {
        const created = await apiMutation<TrainingSession>(
          "/api/trainings/sessions",
          "POST",
          payload
        );
        await fetchTrainingSessions();
        return created;
      }),
    [fetchTrainingSessions, runTrainingSessionMutation]
  );

  const updateTrainingSession = useCallback(
    async (id: string, payload: MutationPayload) =>
      runTrainingSessionMutation(async () => {
        const updated = await apiMutation<TrainingSession>(
          `/api/trainings/sessions/${id}`,
          "PATCH",
          payload
        );
        await fetchTrainingSessions();
        return updated;
      }),
    [fetchTrainingSessions, runTrainingSessionMutation]
  );

  const deleteTrainingSession = useCallback(
    async (id: string) =>
      runTrainingSessionMutation(async () => {
        await apiMutation<undefined>(`/api/trainings/sessions/${id}`, "DELETE");
        await fetchTrainingSessions();
      }),
    [fetchTrainingSessions, runTrainingSessionMutation]
  );

  const createTrainingEnrollment = useCallback(
    async (payload: MutationPayload) =>
      runTrainingEnrollmentMutation(async () => {
        const created = await apiMutation<TrainingEnrollment>(
          "/api/trainings/enrollments",
          "POST",
          payload
        );
        await fetchTrainingEnrollments();
        return created;
      }),
    [fetchTrainingEnrollments, runTrainingEnrollmentMutation]
  );

  const updateTrainingEnrollment = useCallback(
    async (id: string, payload: MutationPayload) =>
      runTrainingEnrollmentMutation(async () => {
        const updated = await apiMutation<TrainingEnrollment>(
          `/api/trainings/enrollments/${id}`,
          "PATCH",
          payload
        );
        await fetchTrainingEnrollments();
        return updated;
      }),
    [fetchTrainingEnrollments, runTrainingEnrollmentMutation]
  );

  const deleteTrainingEnrollment = useCallback(
    async (id: string) =>
      runTrainingEnrollmentMutation(async () => {
        await apiMutation<undefined>(
          `/api/trainings/enrollments/${id}`,
          "DELETE"
        );
        await fetchTrainingEnrollments();
      }),
    [fetchTrainingEnrollments, runTrainingEnrollmentMutation]
  );

  const createCertification = useCallback(
    async (payload: MutationPayload) =>
      runCertificationMutation(async () => {
        const created = await apiMutation<EmployeeCertification>(
          "/api/employees/certifications",
          "POST",
          payload
        );
        await fetchCertifications();
        return created;
      }),
    [fetchCertifications, runCertificationMutation]
  );

  const updateCertification = useCallback(
    async (id: string, payload: MutationPayload) =>
      runCertificationMutation(async () => {
        const updated = await apiMutation<EmployeeCertification>(
          `/api/employees/certifications/${id}`,
          "PATCH",
          payload
        );
        await fetchCertifications();
        return updated;
      }),
    [fetchCertifications, runCertificationMutation]
  );

  const deleteCertification = useCallback(
    async (id: string) =>
      runCertificationMutation(async () => {
        await apiMutation<undefined>(
          `/api/employees/certifications/${id}`,
          "DELETE"
        );
        await fetchCertifications();
      }),
    [fetchCertifications, runCertificationMutation]
  );

  const createSkill = useCallback(
    async (payload: MutationPayload) =>
      runSkillMutation(async () => {
        const created = await apiMutation<EmployeeSkill>(
          "/api/employees/skills",
          "POST",
          payload
        );
        await fetchSkills();
        return created;
      }),
    [fetchSkills, runSkillMutation]
  );

  const updateSkill = useCallback(
    async (id: string, payload: MutationPayload) =>
      runSkillMutation(async () => {
        const updated = await apiMutation<EmployeeSkill>(
          `/api/employees/skills/${id}`,
          "PATCH",
          payload
        );
        await fetchSkills();
        return updated;
      }),
    [fetchSkills, runSkillMutation]
  );

  const deleteSkill = useCallback(
    async (id: string) =>
      runSkillMutation(async () => {
        await apiMutation<undefined>(`/api/employees/skills/${id}`, "DELETE");
        await fetchSkills();
      }),
    [fetchSkills, runSkillMutation]
  );

  const value = useMemo<DatabaseContextValue>(
    () => ({
      employees,
      departments,
      projects,
      assignments,
      milestones,
      documents,
      activities,
      alerts,
      trainingSessions,
      trainingEnrollments,
      certifications,
      skills,
      employeeMutation,
      departmentMutation,
      projectMutation,
      assignmentMutation,
      milestoneMutation,
      documentMutation,
      activityMutation,
      alertMutation,
      trainingSessionMutation,
      trainingEnrollmentMutation,
      certificationMutation,
      skillMutation,
      fetchEmployees,
      fetchDepartments,
      fetchProjects,
      fetchAssignments,
      fetchMilestones,
      fetchDocuments,
      fetchActivities,
      fetchAlerts,
      fetchTrainingSessions,
      fetchTrainingEnrollments,
      fetchCertifications,
      fetchSkills,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      createProject,
      updateProject,
      deleteProject,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      createMilestone,
      updateMilestone,
      deleteMilestone,
      createDocument,
      updateDocument,
      deleteDocument,
      createActivity,
      updateActivity,
      deleteActivity,
      createAlert,
      updateAlert,
      deleteAlert,
      createTrainingSession,
      updateTrainingSession,
      deleteTrainingSession,
      createTrainingEnrollment,
      updateTrainingEnrollment,
      deleteTrainingEnrollment,
      createCertification,
      updateCertification,
      deleteCertification,
      createSkill,
      updateSkill,
      deleteSkill,
    }),
    [
      activities,
      activityMutation,
      alerts,
      alertMutation,
      assignments,
      assignmentMutation,
      certifications,
      certificationMutation,
      departments,
      departmentMutation,
      documents,
      documentMutation,
      employees,
      employeeMutation,
      fetchActivities,
      fetchAlerts,
      fetchAssignments,
      fetchCertifications,
      fetchDepartments,
      fetchDocuments,
      fetchEmployees,
      fetchMilestones,
      fetchProjects,
      fetchSkills,
      fetchTrainingEnrollments,
      fetchTrainingSessions,
      milestones,
      milestoneMutation,
      projects,
      projectMutation,
      skills,
      skillMutation,
      trainingEnrollments,
      trainingEnrollmentMutation,
      trainingSessions,
      trainingSessionMutation,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      createProject,
      updateProject,
      deleteProject,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      createMilestone,
      updateMilestone,
      deleteMilestone,
      createDocument,
      updateDocument,
      deleteDocument,
      createActivity,
      updateActivity,
      deleteActivity,
      createAlert,
      updateAlert,
      deleteAlert,
      createTrainingSession,
      updateTrainingSession,
      deleteTrainingSession,
      createTrainingEnrollment,
      updateTrainingEnrollment,
      deleteTrainingEnrollment,
      createCertification,
      updateCertification,
      deleteCertification,
      createSkill,
      updateSkill,
      deleteSkill,
    ]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error(
      "useDatabase doit être utilisé à l'intérieur de DatabaseProvider"
    );
  }
  return context;
}

export function useDatabaseResource<T>(
  selector: (context: DatabaseContextValue) => FetchState<T>
) {
  const context = useDatabase();
  return selector(context);
}

export const emptyFetchState = DEFAULT_STATE;
export const emptyMutationState = DEFAULT_MUTATION;
