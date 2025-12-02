import React, { useEffect, useState } from "react";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const OverviewCards: React.FC = () => {
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');

    const tryFetchCount = async () => {
      // build payload and params once for both attempts
      const payload = {
        student_id: Number(localStorage.getItem('user_id')) || undefined,
        organization_id: Number(localStorage.getItem('organization_id')) || 1,
        session_id: localStorage.getItem('session_id') || '2025-26',
        semester_id: localStorage.getItem('semester_id') || 'SEM1',
      };
      const params = new URLSearchParams();
      if (payload.student_id !== undefined) params.append('student_id', String(payload.student_id));
      if (payload.organization_id !== undefined) params.append('organization_id', String(payload.organization_id));
      if (payload.session_id) params.append('session_id', payload.session_id);
      if (payload.semester_id) params.append('semester_id', payload.semester_id);

      try {
        // Try a dedicated count endpoint first (pass payload as query params)
        const countUrl = params.toString() ? `${apiBaseUrl}/students/me/enrolled-courses/count?${params.toString()}` : `${apiBaseUrl}/students/me/enrolled-courses/count`;
        const res = await fetch(countUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          // accept { count } or { total } or { data: [...] }
          const count = Number(json?.count ?? json?.total ?? (Array.isArray(json?.data) ? json.data.length : undefined));
          if (!Number.isNaN(count) && mounted) setEnrolledCount(count);
          return;
        }
      } catch (err) {
        // ignore and fall back
      }

      try {
        // Fallback: fetch the list and count items
        const listParams = params.toString() ? `?${params.toString()}` : '';
        const listUrl = `${apiBaseUrl}/students/me/enrolled-courses${listParams}`;
        const res2 = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!res2.ok) {
          if (mounted) setEnrolledCount(0);
          return;
        }
        const json2 = await res2.json();
        const items = Array.isArray(json2) ? json2 : (Array.isArray(json2?.data) ? json2.data : []);
        if (mounted) setEnrolledCount(items.length);
      } catch (err) {
        if (mounted) setEnrolledCount(0);
      }
    };

    tryFetchCount();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
      <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-5 rounded-2xl shadow-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <BookOpen className="text-blue-600 w-8 h-8" />
          <span className="text-3xl font-bold text-blue-700">{enrolledCount === null ? '—' : enrolledCount}</span>
        </div>
        <p className="mt-4 text-gray-700 font-semibold text-lg">Enrolled Courses</p>
      </div>
      <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-8 rounded-2xl shadow-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <ClipboardList className="text-indigo-600 w-8 h-8" />
          <span className="text-3xl font-bold text-indigo-700">2</span>
        </div>
        <p className="mt-4 text-gray-700 font-semibold text-lg">Assignments</p>
      </div>
      <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-8 rounded-2xl shadow-lg border border-teal-200">
        <div className="flex items-center justify-between">
          <GraduationCap className="text-teal-600 w-8 h-8" />
          <span className="text-3xl font-bold text-teal-700">B+</span>
        </div>
        <p className="mt-4 text-gray-700 font-semibold text-lg">Grades</p>
      </div>
    </div>
  );
};

export default OverviewCards;
