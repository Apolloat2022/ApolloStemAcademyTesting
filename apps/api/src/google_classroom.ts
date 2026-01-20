
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

    async getStudents(token: string, courseId: string): Promise<any> {
        const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch students');
        return await res.json();
    }

    async getTeachers(token: string, courseId: string): Promise<any> {
        const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch teachers');
        return await res.json();
    }

    // Student sync: Import assignments from enrolled courses
    async syncStudentCourses(env: any, token: string, studentId: string) {
        const coursesData = await this.getCourses(token) as any;

        let syncedCount = 0;
        if (coursesData.courses && coursesData.courses.length > 0) {
            for (const course of coursesData.courses) {
                // 1. Sync Class (Upsert)
                await env.DB.prepare(
                    'INSERT OR IGNORE INTO classes (id, name, section, subject) VALUES (?, ?, ?, ?)'
                ).bind(
                    course.id, 
                    course.name, 
                    course.section || 'General', 
                    course.descriptionHeading || 'General'
                ).run();

                // 2. Enroll Student
                await env.DB.prepare(
                    'INSERT OR IGNORE INTO enrollments (student_id, class_id) VALUES (?, ?)'
                ).bind(studentId, course.id).run();

                // 3. Sync CourseWork
                const workData = await this.getCourseWork(token, course.id) as any;
                if (workData.courseWork) {
                    for (const w of workData.courseWork) {
                        const dueDate = w.dueDate 
                            ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, '0')}-${String(w.dueDate.day).padStart(2, '0')}`
                            : 'No Due Date';
                        
                        await env.DB.prepare(
                            'INSERT OR IGNORE INTO assignments (id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)'
                        ).bind(
                            w.id, 
                            course.id, 
                            w.title, 
                            w.description || 'Imported from Google Classroom', 
                            dueDate
                        ).run();
                        syncedCount++;
                    }
                }
            }

            // Update last sync timestamp
            await env.DB.prepare(
                'UPDATE users SET last_sync_at = datetime("now") WHERE id = ?'
            ).bind(studentId).run();
        }
        
        return { success: true, count: syncedCount };
    }

    // Teacher sync: Import classes they teach and all coursework
    async syncTeacherCourses(env: any, token: string, teacherId: string) {
        const coursesData = await this.getCourses(token) as any;

        let classCount = 0;
        let assignmentCount = 0;
        let studentCount = 0;

        if (coursesData.courses && coursesData.courses.length > 0) {
            for (const course of coursesData.courses) {
                // Check if user is a teacher in this course
                const teachersData = await this.getTeachers(token, course.id) as any;
                const isTeacher = teachersData.teachers?.some((t: any) => t.userId === teacherId);
                
                if (!isTeacher) continue; // Skip courses where they're not a teacher

                // 1. Create/Update Class
                await env.DB.prepare(
                    `INSERT INTO classes (id, name, section, subject, teacher_id) 
                     VALUES (?, ?, ?, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET 
                     name = excluded.name,
                     section = excluded.section,
                     subject = excluded.subject,
                     teacher_id = excluded.teacher_id`
                ).bind(
                    course.id,
                    course.name,
                    course.section || 'General',
                    course.descriptionHeading || 'General',
                    teacherId
                ).run();
                classCount++;

                // 2. Sync Students
                const studentsData = await this.getStudents(token, course.id) as any;
                if (studentsData.students) {
                    for (const student of studentsData.students) {
                        // Create student user if doesn't exist
                        await env.DB.prepare(
                            `INSERT OR IGNORE INTO users (id, email, name, role) 
                             VALUES (?, ?, ?, 'student')`
                        ).bind(
                            student.userId,
                            student.profile?.emailAddress || 'unknown@classroom.google.com',
                            student.profile?.name?.fullName || 'Unknown Student'
                        ).run();

                        // Enroll student
                        await env.DB.prepare(
                            'INSERT OR IGNORE INTO enrollments (student_id, class_id) VALUES (?, ?)'
                        ).bind(student.userId, course.id).run();
                        studentCount++;
                    }
                }

                // 3. Sync Assignments
                const workData = await this.getCourseWork(token, course.id) as any;
                if (workData.courseWork) {
                    for (const w of workData.courseWork) {
                        const dueDate = w.dueDate 
                            ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, '0')}-${String(w.dueDate.day).padStart(2, '0')}`
                            : null;
                        
                        await env.DB.prepare(
                            `INSERT INTO assignments (id, class_id, title, description, due_date, created_at) 
                             VALUES (?, ?, ?, ?, ?, datetime('now'))
                             ON CONFLICT(id) DO UPDATE SET
                             title = excluded.title,
                             description = excluded.description,
                             due_date = excluded.due_date`
                        ).bind(
                            w.id,
                            course.id,
                            w.title,
                            w.description || '',
                            dueDate
                        ).run();
                        assignmentCount++;
                    }
                }
            }

            // Update last sync
            await env.DB.prepare(
                'UPDATE users SET last_sync_at = datetime("now") WHERE id = ?'
            ).bind(teacherId).run();
        }

        return { 
            success: true, 
            classes: classCount, 
            assignments: assignmentCount, 
            students: studentCount 
        };
    }

    // Volunteer sync: No direct classroom access, but can view linked students' data
    async syncVolunteerData(env: any, volunteerId: string) {
        // Volunteers don't directly import from Google Classroom
        // Instead, they can see aggregated data from students they mentor
        // This is just a placeholder to update sync timestamp
        
        await env.DB.prepare(
            'UPDATE users SET last_sync_at = datetime("now") WHERE id = ?'
        ).bind(volunteerId).run();

        // Get count of students this volunteer is assigned to
        const result = await env.DB.prepare(
            `SELECT COUNT(DISTINCT s.id) as count
             FROM users s
             JOIN enrollments e ON s.id = e.student_id
             WHERE s.role = 'student'`
        ).first() as any;

        return { 
            success: true, 
            studentCount: result?.count || 0 
        };
    }
}

export const googleClassroom = new GoogleClassroomService();
