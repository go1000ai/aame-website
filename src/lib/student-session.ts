import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type StudentSession = {
  email: string;
  name: string;
  enrollmentId: string;
};

export async function getStudentSession(): Promise<StudentSession> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("student_session");

  if (!sessionCookie?.value) {
    redirect("/student/login");
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    redirect("/student/login");
  }
}
