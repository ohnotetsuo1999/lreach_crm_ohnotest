"use client";

import { useEffect, useState } from "react";
import { IconButton } from "./button";
import { Card, Container } from "./common";
import { Pencil, Trash2 } from "lucide-react";

type FormTemplate = {
  id: string;
  title: string;
  description: string;
};

type TemplateField = {
  id: string;
  label: string;
  order_index: number;
  is_required: boolean;
  template_id: string;
};

export function FormTemplateSettings() {
  // Mock data for demonstration
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([
    {
      id: "template1",
      title: "基本情報フォーム",
      description: "お客様の基本情報を収集するテンプレート",
    },
    {
      id: "template2",
      title: "詳細ヒアリングフォーム",
      description: "詳細な要望をヒアリングするためのテンプレート",
    },
  ]);
  
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([
    { id: "field1", label: "お名前", order_index: 1, is_required: true, template_id: "template1" },
    { id: "field2", label: "メールアドレス", order_index: 2, is_required: true, template_id: "template1" },
    { id: "field3", label: "電話番号", order_index: 3, is_required: false, template_id: "template1" },
    { id: "field4", label: "ご要望", order_index: 1, is_required: true, template_id: "template2" },
    { id: "field5", label: "予算", order_index: 2, is_required: false, template_id: "template2" },
  ]);

  return (
    <section className="relative">
      <Container size="large">
        <div className="flex flex-col gap-4">
          <IconButton href="/form-template/new" type="create" />
          <ul className="grid grid-cols-2 gap-4">
            {formTemplates.map((formTemplate) => (
              <li key={formTemplate.id}>
                <Card>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formTemplate.title}
                        </h3>
                        {formTemplate.description && (
                          <p className="text-sm text-gray-600 italic border-l border-gray-200 pl-3">
                            {formTemplate.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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
                    <div className="flex flex-wrap gap-2">
                      {templateFields
                        .filter(
                          (field) => field.template_id === formTemplate.id
                        )
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((templateField) => (
                          <div
                            key={templateField.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            <span>{templateField.label}</span>
                            {templateField.is_required && (
                              <span className="text-red-500">*</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}