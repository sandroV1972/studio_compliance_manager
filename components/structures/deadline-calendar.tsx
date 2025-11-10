"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "DONE" | "OVERDUE" | "CANCELLED";
}

interface DeadlineCalendarProps {
  deadlines: Deadline[];
}

export function DeadlineCalendar({ deadlines }: DeadlineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first and last day of current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate array of days for calendar grid
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  // Adjust so Monday is first day of week
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get deadlines for a specific day
  const getDeadlinesForDay = (day: number): Deadline[] => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    )
      .toISOString()
      .split("T")[0];

    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.dueDate)
        .toISOString()
        .split("T")[0];
      return deadlineDate === dateStr;
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month and year
  const monthYear = currentDate.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  // Check if day is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "DONE":
        return "bg-green-500";
      case "OVERDUE":
        return "bg-red-500";
      case "PENDING":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{monthYear}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Oggi
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Gio</div>
        <div>Ven</div>
        <div>Sab</div>
        <div>Dom</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-20" />;
          }

          const dayDeadlines = getDeadlinesForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`
                min-h-20 p-2 border rounded-lg transition-colors
                ${today ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white"}
                ${dayDeadlines.length > 0 ? "hover:bg-gray-50 cursor-pointer" : ""}
              `}
            >
              <div
                className={`
                  text-sm font-medium mb-1
                  ${today ? "text-indigo-700" : "text-gray-700"}
                `}
              >
                {day}
              </div>
              {dayDeadlines.length > 0 && (
                <div className="space-y-1">
                  {dayDeadlines.slice(0, 2).map((deadline) => (
                    <div
                      key={deadline.id}
                      className="text-xs truncate"
                      title={deadline.title}
                    >
                      <div
                        className={`
                          ${getStatusColor(deadline.status)}
                          text-white px-1 py-0.5 rounded
                        `}
                      >
                        {deadline.title}
                      </div>
                    </div>
                  ))}
                  {dayDeadlines.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayDeadlines.length - 2} altro
                      {dayDeadlines.length - 2 > 1 ? "i" : ""}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>In attesa</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Completato</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Scaduto</span>
        </div>
      </div>
    </div>
  );
}
