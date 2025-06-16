"use client";

import { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";
import {
  isSameDay,
  setHours,
  setMinutes,
  addMinutes,
  addDays,
  addHours,
} from "date-fns";

import { Card, Container } from "./common";
import { InputField, SelectField } from "./form";
import { SideModal } from "./modal";

interface GoogleCalendarEvent {
  id: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  summary: string;
  description?: string;
  location?: string;
}

interface AvailableTimeSlot {
  start: string;
  end: string;
}

type GroupedTimeSlots = {
  [date: string]: AvailableTimeSlot[];
};

interface SearchableItem {
  id: string;
  label: string;
  displayName: string;
  inflow_path_id?: string;
  lp3_answers_id?: string;
  hasLineUsername: boolean;
}

// フォームデータの型定義
interface FormData {
  booker_name: string;
  line_user_id: string;
  reminder_type: string;
  title: string;
}

// リマインダータイプの型定義
interface ReminderType {
  id: string;
  name: string;
}

// 時間帯選択コンポーネントを分割
const TimeSlotCell = memo(
  ({
    date,
    time,
    matchingSlots,
    selectedTimeSlot,
    onTimeSlotSelect,
  }: {
    date: string;
    time: string;
    matchingSlots: AvailableTimeSlot[];
    selectedTimeSlot: AvailableTimeSlot | null;
    onTimeSlotSelect: (slot: AvailableTimeSlot) => void;
  }) => {
    const dateObj = new Date(date);
    const isSaturday = dateObj.getDay() === 6;
    const isSunday = dateObj.getDay() === 0;
    const timeSlotId =
      matchingSlots.length > 0
        ? `time-slot-${matchingSlots[0].start}`
        : `time-slot-${date}-${time}`;

    if (matchingSlots.length === 0) {
      return (
        <td className="w-[60px]">
          <div
            className={`w-full aspect-square mx-auto border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 bg-gray-100`}
          >
            ×
          </div>
        </td>
      );
    }

    return (
      <td className="w-[60px]">
        <label
          htmlFor={timeSlotId}
          className={`block w-full aspect-square mx-auto border border-gray-200 flex items-center justify-center text-lg font-bold cursor-pointer transition-all ${
            selectedTimeSlot?.start === matchingSlots[0].start
              ? "bg-blue-600 text-white shadow-sm scale-[1.02]"
              : `text-blue-600 hover:shadow-sm hover:scale-[1.02] ${
                  isSaturday ? "bg-blue-50" : isSunday ? "bg-red-50" : ""
                }`
          }`}
        >
          <input
            type="radio"
            id={timeSlotId}
            name="timeSlot"
            value={matchingSlots[0].start}
            checked={selectedTimeSlot?.start === matchingSlots[0].start}
            onChange={() => onTimeSlotSelect(matchingSlots[0])}
            className="sr-only"
          />
          ○
        </label>
      </td>
    );
  }
);
TimeSlotCell.displayName = "TimeSlotCell";

// ユーザー検索結果コンポーネントを分割
const UserSearchResults = memo(
  ({
    users,
    onUserSelect,
  }: {
    users: SearchableItem[];
    onUserSelect: (user: SearchableItem) => void;
  }) => {
    if (users.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          該当するユーザーが見つかりませんでした
        </div>
      );
    }

    return (
      <>
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onUserSelect(user)}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900 truncate">
                    {user.displayName === "名前未設定" ? (
                      <>
                        {user.hasLineUsername ? (
                          <>
                            <span className="text-gray-500">未設定</span>
                            <span className="text-gray-500 font-normal">
                              （{user.label}）
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-gray-500">未設定</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              LINE名未設定
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {user.displayName}
                        {user.hasLineUsername ? (
                          <span className="text-gray-500 font-normal">
                            （{user.label}）
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            LINE名未設定
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 truncate mt-1">
                  {user.id}
                </div>
              </div>
            </div>
          </button>
        ))}
      </>
    );
  }
);
UserSearchResults.displayName = "UserSearchResults";

// 予約フォームコンポーネント
const ReservationForm = memo(
  ({
    selectedTimeSlot,
    selectedDuration,
    formData,
    onFormDataChange,
    onUserSelect,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    filteredUsers,
    searchInputRef,
    handleClearSearch,
    handleSearchClick,
    onSubmit,
    reminderTypeOptions,
    description,
    onDescriptionChange,
    staffName,
  }: {
    selectedTimeSlot: AvailableTimeSlot;
    selectedDuration: number;
    formData: FormData;
    onFormDataChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onUserSelect: (user: SearchableItem) => void;
    setSearchQuery: (query: string) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (isOpen: boolean) => void;
    filteredUsers: SearchableItem[];
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    handleClearSearch: () => void;
    handleSearchClick: () => void;
    onSubmit: (e: React.FormEvent) => void;
    reminderTypeOptions: ReminderType[];
    description: string;
    onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    staffName: string;
  }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-4">
          {/* 予約日時 */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">予約日時</p>
              <p className="font-medium text-gray-900">
                {new Date(selectedTimeSlot.start)
                  .toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })
                  .replace("(", "（")
                  .replace(")", "）")}{" "}
                {new Date(selectedTimeSlot.start).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* 所要時間 */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">所要時間</p>
              <p className="font-medium text-gray-900">{selectedDuration}分</p>
            </div>
          </div>
          <InputField
            htmlFor="title"
            label="予定名"
            value={formData.title}
            type="text"
            required
            readonly
          />
          <InputField
            htmlFor="description"
            label="予定詳細"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onDescriptionChange(e)
            }
            placeholder="予定の詳細を入力してください"
            required
            type="text"
            value={description}
          />
          {/* LINEユーザー検索フィールド */}
          <div className="relative">
            <label
              htmlFor="booker_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ユーザー名
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative" ref={searchInputRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="booker_name"
                    name="booker_name"
                    value={formData.booker_name}
                    onChange={(e) => {
                      onFormDataChange(e);
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="例) 山田太郎"
                    className="w-full px-3 py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoComplete="off"
                  />
                  {formData.booker_name && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearSearch();
                        onFormDataChange({
                          target: { name: "booker_name", value: "" },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>検索</span>
                </button>
              </div>
              {isSearchOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[calc(100vh-300px)] overflow-y-auto">
                  <UserSearchResults
                    users={filteredUsers}
                    onUserSelect={(user) => {
                      onUserSelect(user);
                      onFormDataChange({
                        target: {
                          name: "booker_name",
                          value: user.displayName,
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <InputField
            htmlFor="line_user_id"
            label="LINEユーザーID"
            onChange={onFormDataChange}
            readonly
            required
            type="text"
            value={formData.line_user_id}
          />
          <SelectField
            label="リマインドタイプ"
            htmlFor="reminder_type"
            required
            options={reminderTypeOptions.map((type) => ({
              value: type.id,
              label: type.name,
            }))}
            onChange={onFormDataChange}
            value={formData.reminder_type}
          />
        </div>
      </div>
    );
  }
);
ReservationForm.displayName = "ReservationForm";

export function InterviewBooking() {
  // Mock data for demonstration
  const [googleCalenderEvents, setGoogleCalenderEvents] = useState<
    GoogleCalendarEvent[]
  >([
    {
      id: "1",
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: addHours(new Date(), 1).toISOString() },
      summary: "既存の予定",
      description: "サンプルの予定です",
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    AvailableTimeSlot[]
  >([]);
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<GroupedTimeSlots>(
    {}
  );
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<AvailableTimeSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderTypeOptions, setReminderTypeOptions] = useState<
    ReminderType[]
  >([
    { id: "1", name: "1日前リマインド" },
    { id: "2", name: "即時リマインド" },
  ]);
  const [description, setDescription] = useState("");
  const staffName = "スタッフ名";

  const [formData, setFormData] = useState<FormData>({
    booker_name: "",
    line_user_id: "",
    reminder_type: "",
    title: "",
  });

  const [lineUsers, setLineUsers] = useState<SearchableItem[]>([
    {
      id: "user1",
      label: "田中太郎",
      displayName: "田中太郎",
      hasLineUsername: true,
    },
    {
      id: "user2",
      label: "佐藤花子",
      displayName: "佐藤花子",
      hasLineUsername: true,
    },
    {
      id: "user3",
      label: "名前未設定",
      displayName: "名前未設定",
      hasLineUsername: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [deletingEvent, setDeletingEvent] =
    useState<GoogleCalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const durationOptions = [
    { value: 15, label: "15分" },
    { value: 30, label: "30分" },
    { value: 45, label: "45分" },
    { value: 60, label: "60分" },
    { value: 75, label: "75分" },
    { value: 90, label: "90分" },
    { value: 105, label: "105分" },
    { value: 120, label: "120分" },
    { value: 135, label: "135分" },
    { value: 150, label: "150分" },
    { value: 165, label: "165分" },
    { value: 180, label: "180分" },
  ];

  const groupTimeSlotsByDuration = (
    slots: AvailableTimeSlot[],
    hour: number,
    duration: number
  ) => {
    const timeSlots = [];
    const interval = Math.min(30, duration);
    const now = new Date();

    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const matchingSlots = slots.filter((slot) => {
        const slotDate = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        const slotDuration =
          (slotEnd.getTime() - slotDate.getTime()) / (1000 * 60);
        const isToday = isSameDay(slotDate, now);
        const isPastTime = isToday && slotDate < now;

        return (
          slotDate.getHours() === hour &&
          slotDate.getMinutes() === minute &&
          slotDuration >= duration &&
          !isPastTime
        );
      });
      if (matchingSlots.length > 0) {
        timeSlots.push({ time, slots: matchingSlots });
      }
    }
    return timeSlots;
  };

  const memoizedTimeSlots = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      const hour = i + 11;
      const slots = groupTimeSlotsByDuration(
        availableTimeSlots,
        hour,
        selectedDuration
      );
      return slots.map((slot) => ({
        time: slot.time,
        slots: slot.slots,
      }));
    }).flat();
  }, [availableTimeSlots, selectedDuration]);

  const memoizedFilteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return lineUsers;
    const searchLower = searchQuery.toLowerCase().trim();
    return lineUsers.filter((user) => {
      if (!user) return false;
      const displayName =
        user.displayName === "名前未設定"
          ? "未設定"
          : user.displayName.toLowerCase();
      const label = user.label.toLowerCase();
      return displayName.includes(searchLower) || label.includes(searchLower);
    });
  }, [searchQuery, lineUsers]);

  useEffect(() => {
    setSelectedTimeSlot(null);
  }, []);

  const calculateAvailableTimeSlots = useCallback(() => {
    if (!googleCalenderEvents) return;

    const slots: AvailableTimeSlot[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const grouped: GroupedTimeSlots = {};

    for (let i = 0; i < 20; i++) {
      const currentDate = addDays(today, i);
      const dateStr = currentDate.toLocaleDateString("ja-JP");
      const daySlots: AvailableTimeSlot[] = [];
      const isToday = isSameDay(currentDate, now);

      const bookedSlots = googleCalenderEvents
        .filter((event) =>
          isSameDay(new Date(event.start.dateTime), currentDate)
        )
        .map((event) => ({
          start: event.start.dateTime,
          end: event.end.dateTime,
        }));

      const fiveHoursLater = addHours(now, 5);
      const startTime = isToday
        ? fiveHoursLater.getHours() < 11
          ? setHours(setMinutes(currentDate, 0), 11)
          : fiveHoursLater
        : setHours(setMinutes(currentDate, 0), 11);
      const endTime = setHours(setMinutes(currentDate, 0), 23);

      let currentTime = startTime;
      while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, selectedDuration);
        if (slotEnd > endTime) break;

        const isBooked = bookedSlots.some(
          (slot) =>
            (new Date(slot.start) <= currentTime &&
              new Date(slot.end) > currentTime) ||
            (new Date(slot.start) < slotEnd && new Date(slot.end) >= slotEnd)
        );

        const isAfterFiveHours = currentTime >= fiveHoursLater;

        if (!isBooked && isAfterFiveHours) {
          const slot = {
            start: currentTime.toISOString(),
            end: slotEnd.toISOString(),
          };
          daySlots.push(slot);
          slots.push(slot);
        }
        currentTime = addMinutes(currentTime, 30);
      }

      grouped[dateStr] = daySlots;
    }

    setAvailableTimeSlots(slots);
    setGroupedTimeSlots(grouped);
  }, [googleCalenderEvents, selectedDuration]);

  useEffect(() => {
    calculateAvailableTimeSlots();
  }, [calculateAvailableTimeSlots]);

  const handleTimeSlotSelect = useCallback((timeSlot: AvailableTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsModalOpen(true);
  }, []);

  const handleDurationSelect = useCallback((duration: number) => {
    setSelectedDuration(duration);
    setSelectedTimeSlot(null);
  }, []);

  const handleFormDataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSearchQuery("");
    setDescription("");
  }, [setIsModalOpen, setSearchQuery, setDescription]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!selectedTimeSlot) {
          throw new Error("時間スロットが選択されていません");
        }

        setIsSubmitting(true);
        
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setToastMessage("予約を作成しました");
        handleCloseModal();
      } catch (error) {
        console.error("予約処理中にエラーが発生しました:", error);
        alert(
          error instanceof Error
            ? error.message
            : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      selectedTimeSlot,
      handleCloseModal,
    ]
  );

  const getSelectedDayEvents = (date: Date) => {
    return googleCalenderEvents.filter((event) =>
      isSameDay(new Date(event.start.dateTime), date)
    );
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFormData((prev) => ({
      ...prev,
      booker_name: "",
      line_user_id: "",
    }));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
    setIsSearchOpen(true);
  };

  const handleUserSelect = useCallback((user: SearchableItem) => {
    setFormData((prev) => ({
      ...prev,
      line_user_id: user.id,
      booker_name:
        user.displayName === "名前未設定" ? user.label : user.displayName,
    }));
    setSearchQuery("");
    setIsSearchOpen(false);
    setIsSearchModalOpen(false);
  }, []);

  useEffect(() => {
    const newTitle = (() => {
      if (formData.booker_name && description) {
        return `${formData.booker_name} × ${staffName}：${description}`;
      }
      if (formData.booker_name) {
        return `${formData.booker_name} × ${staffName}：{予定詳細}`;
      }
      if (description) {
        return `{ユーザー名} × ${staffName}：${description}`;
      }
      return `{ユーザー名} × ${staffName}：{予定詳細}`;
    })();

    setFormData((prev) => ({
      ...prev,
      title: newTitle,
    }));
  }, [formData.booker_name, description, staffName]);

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      try {
        setIsDeleting(true);
        
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGoogleCalenderEvents(prev => prev.filter(e => e.id !== eventId));
        calculateAvailableTimeSlots();

        setToastMessage("予定を削除しました");
        setDeletingEvent(null);
      } catch (error) {
        console.error("予定削除中にエラーが発生しました:", error);
        setToastMessage(
          error instanceof Error
            ? error.message
            : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [calculateAvailableTimeSlots]
  );

  // トースト自動消去
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <section className="relative">
      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}
      <Container size="large">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <Card>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                面談予約
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                所要時間と日時を選択してください。○が選択可能な時間帯、×が選択不可の時間帯です。
                <br />
                ※本日の過去の時間帯は選択できません。
              </p>
              <div className="flex flex-wrap gap-1.5">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDurationSelect(option.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      selectedDuration === option.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="w-[60px] h-8 bg-gray-200 rounded"></th>
                          {[...Array(20)].map((_, i) => (
                            <th
                              key={i}
                              className="w-[60px] h-8 bg-gray-200 rounded"
                            ></th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...Array(24)].map((_, i) => (
                          <tr key={i}>
                            <td className="h-12 bg-gray-200 rounded"></td>
                            {[...Array(20)].map((_, j) => (
                              <td
                                key={j}
                                className="h-12 bg-gray-200 rounded"
                              ></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <table className="w-full border-separate border-spacing-1">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-[60px] p-1.5 text-left text-xs font-medium text-gray-500 border border-gray-200 sticky left-0 bg-gray-50 z-10"></th>
                        {Object.keys(groupedTimeSlots).map((date) => {
                          const dateObj = new Date(date);
                          const weekday = dateObj.toLocaleDateString("ja-JP", {
                            weekday: "short",
                          });
                          const isSaturday = dateObj.getDay() === 6;
                          const isSunday = dateObj.getDay() === 0;
                          return (
                            <th
                              key={date}
                              className="w-[60px] p-1.5 text-center text-xs font-medium border border-gray-200"
                              style={{
                                backgroundColor: isSaturday
                                  ? "#EFF6FF"
                                  : isSunday
                                  ? "#FEF2F2"
                                  : "",
                                color: isSaturday
                                  ? "#2563EB"
                                  : isSunday
                                  ? "#DC2626"
                                  : "#6B7280",
                              }}
                            >
                              <div className="text-xs font-bold mb-0.5">
                                ({weekday})
                              </div>
                              <div className="text-xs font-bold">
                                {dateObj.getMonth() + 1}/{dateObj.getDate()}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {memoizedTimeSlots.map(({ time, slots }) => (
                        <tr key={time}>
                          <td className="w-[60px] p-1.5 text-xs text-gray-600 border border-gray-200 sticky left-0 z-10 bg-gray-50">
                            <div className="text-xs font-bold text-gray-900">
                              {time}
                            </div>
                          </td>
                          {Object.entries(groupedTimeSlots).map(([date]) => (
                            <TimeSlotCell
                              key={`${date}-${time}`}
                              date={date}
                              time={time}
                              matchingSlots={slots.filter(
                                (slot) =>
                                  new Date(slot.start).toLocaleDateString(
                                    "ja-JP"
                                  ) === date
                              )}
                              selectedTimeSlot={selectedTimeSlot}
                              onTimeSlotSelect={handleTimeSlotSelect}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Container>

      <SideModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedTimeSlot && (
          <form className="h-full flex flex-col" onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">選択日時</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedTimeSlot.start)
                  .toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })
                  .replace("(", "（")
                  .replace(")", "）")}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900">
                      その日の予定
                    </h3>
                  </div>
                  <div className="h-[200px] overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="p-3 space-y-3">
                      {getSelectedDayEvents(
                        new Date(selectedTimeSlot.start)
                      ).map((event, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 truncate">
                                  {event.summary}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setDeletingEvent(event)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {new Date(
                                    event.start.dateTime
                                  ).toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    event.end.dateTime
                                  ).toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {getSelectedDayEvents(new Date(selectedTimeSlot.start))
                        .length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">
                            予定はありません
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900">
                      面談予約
                    </h3>
                  </div>
                  <ReservationForm
                    selectedTimeSlot={selectedTimeSlot}
                    selectedDuration={selectedDuration}
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onUserSelect={handleUserSelect}
                    setSearchQuery={setSearchQuery}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                    filteredUsers={memoizedFilteredUsers}
                    searchInputRef={searchInputRef}
                    handleClearSearch={handleClearSearch}
                    handleSearchClick={handleSearchClick}
                    onSubmit={handleSubmit}
                    reminderTypeOptions={reminderTypeOptions}
                    description={description}
                    onDescriptionChange={(e) => setDescription(e.target.value)}
                    staffName={staffName}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>送信中...</span>
                    </>
                  ) : (
                    "予約を確定"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </SideModal>

      {isSearchModalOpen && (
        <SideModal isOpen={isSearchModalOpen} onClose={handleCloseSearchModal}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">ユーザー検索</h2>
              <p className="text-sm text-gray-600 mt-1">
                ユーザー名またはLINEユーザーIDで検索してください
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="relative" ref={searchInputRef}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        placeholder="例) 山田太郎"
                        className="w-full px-3 py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoComplete="off"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {isSearchOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[calc(100vh-300px)] overflow-y-auto">
                      <UserSearchResults
                        users={memoizedFilteredUsers}
                        onUserSelect={handleUserSelect}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseSearchModal}
                className="w-full bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </SideModal>
      )}

      {/* 削除確認モーダル */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-bold mb-2 text-gray-900">
              予定の削除確認
            </h2>
            <p className="mb-4 text-gray-700">本当にこの予定を削除しますか？</p>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-800 mb-1">
                {deletingEvent.summary}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(deletingEvent.start.dateTime).toLocaleDateString(
                  "ja-JP",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  }
                )}{" "}
                {new Date(deletingEvent.start.dateTime).toLocaleTimeString(
                  "ja-JP",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
                ～
                {new Date(deletingEvent.end.dateTime).toLocaleTimeString(
                  "ja-JP",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
              {deletingEvent.location && (
                <div className="text-xs text-gray-500 mt-1">
                  場所: {deletingEvent.location}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors font-medium"
                onClick={() => setDeletingEvent(null)}
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleDeleteEvent(deletingEvent.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>削除中...</span>
                  </>
                ) : (
                  "削除する"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}