
export class GoogleClassroomService {
    async getCourses(token: string): Promise<any> {
        const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        return await res.json();
    }

    async getCourseWork(token: string, courseId: string): Promise<any> {
        const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch coursework');
        return await res.json();
    }

    // Helper to sync for a student
    async syncStudentCourses(env: any, token: string, studentId: string) {
        const coursesData = await this.getCourses(token) as any;

        let syncedCount = 0;
        if (coursesData.courses && coursesData.courses.length > 0) {
            for (const course of coursesData.courses) {
                // 1. Sync Class (Upsert)
                await env.DB.prepare('INSERT OR IGNORE INTO classes (id, name, section, subject) VALUES (?, ?, ?, ?)').bind(course.id, course.name, course.section || 'General', 'General').run();

                // 2. Enroll Student
                await env.DB.prepare('INSERT OR IGNORE INTO enrollments (student_id, class_id) VALUES (?, ?)').bind(studentId, course.id).run();

                // 3. Sync CourseWork
                const workData = await this.getCourseWork(token, course.id) as any;
                if (workData.courseWork) {
                    for (const w of workData.courseWork) {
                        await env.DB.prepare('INSERT OR IGNORE INTO assignments (id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)').bind(w.id, course.id, `[GC] ${w.title}`, w.description || 'Imported from Google Classroom', w.dueDate ? `${w.dueDate.year}-${w.dueDate.month}-${w.dueDate.day}` : 'No Due Date').run();
                        syncedCount++;
                    }
                }
            }
        }
        return { success: true, count: syncedCount };
    }
}
export const googleClassroom = new GoogleClassroomService();
