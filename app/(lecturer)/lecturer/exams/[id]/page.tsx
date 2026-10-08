"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExamDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/lecturer/exams/${id}/preview`);
    }
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
      Loading exam...
    </div>
  );
}
