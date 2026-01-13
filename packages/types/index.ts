export type UserRole = 'student' | 'teacher' | 'volunteer' | 'parent';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    created_at?: string;
}

export interface Class {
    id: string;
    name: string;
    teacher_id: string;
}

export interface Assignment {
    id: string;
    class_id: string;
    title: string;
    description: string;
    due_date?: string;
    status?: 'todo' | 'in-progress' | 'completed';
    tool?: string;
}

export interface ProgressLog {
    id: string;
    student_id: string;
    tool_id: string;
    activity_type: string;
    performance_score: number;
    metadata: string;
    created_at: string;
}

export interface AIResponse {
    success: boolean;
    answer?: string;
    error?: string;
}

export interface NarrativeReport {
    studentId: string;
    report: string;
    generatedAt: string;
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    content: string;
    grade?: number;
    feedback?: string;
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    read: boolean;
}
