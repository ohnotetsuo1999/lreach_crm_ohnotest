"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { IconButton } from "./button";
import { Card, Container } from "./common";

type Form = {
  admin_title: string;
  id: string;
  meeting_duration_minutes: string;
  organized_by: string;
  public_description: string;
};

type Staff = {
  id: string;
  name: string;
};

export function BookingFormSettings() {
  // Mock data for demonstration
  const [forms, setForms] = useState<Form[]>([
    {
      id: "1",
      admin_title: "初回面談フォーム",
      meeting_duration_minutes: "30",
      organized_by: "staff1",
      public_description: "初回の面談フォームです",
    },
    {
      id: "2", 
      admin_title: "フォローアップ面談",
      meeting_duration_minutes: "60",
      organized_by: "staff2",
      public_description: "フォローアップ用の面談フォームです",
    },
  ]);
  
  const [staff, setStaff] = useState<Staff[]>([
    { id: "staff1", name: "田中太郎" },
    { id: "staff2", name: "佐藤花子" },
  ]);

  const handleCopyTemplate = async (form: Form) => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/reservation?form_id=${form.id}`;
    await navigator.clipboard.writeText(formUrl);
    alert("URLをコピーしました");
  };

  return (
    <section className="relative">
      <Container size="large">
        <div className="flex flex-col gap-4">
          <IconButton href="/booking-form/new" type="create" />
          <ul className="grid grid-cols-2 gap-4">
            {forms.map((form) => {
              return (
                <li key={form.id}>
                  <Card>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {form.admin_title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            type="button"
                            aria-label="テンプレートをコピー"
                            onClick={() => handleCopyTemplate(form)}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            type="button"
                            aria-label="テンプレートを編集"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            type="button"
                            aria-label="テンプレートを削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        打ち合わせ時間: {form.meeting_duration_minutes}分
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {staff
                          .filter((field) => field.id === form.organized_by)
                          .map((staff) => (
                            <div
                              key={staff.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {staff.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}