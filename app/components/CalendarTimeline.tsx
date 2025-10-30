"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type EventItem = {
  title: string;
  start: Date;
  end: Date;
  desc?: string;
  status?: "confirmed" | "pending";
};

const sampleEvents: EventItem[] = [
  { 
    title: "Site Visit - Client 1", 
    start: new Date('2024-10-29T10:00:00'), 
    end: new Date('2024-10-29T11:00:00'), 
    status: "confirmed" 
  },
  { 
    title: "Material Delivery - Project A", 
    start: new Date('2024-10-30T14:00:00'), 
    end: new Date('2024-10-30T15:30:00'), 
    status: "pending" 
  },
  { 
    title: "Final Handover - Client 3", 
    start: new Date('2024-10-31T09:00:00'), 
    end: new Date('2024-10-31T10:00:00'), 
    status: "confirmed" 
  },
];

export const CalendarTimeline = ({ events = sampleEvents }: { events?: EventItem[] }) => {
  const [selected, setSelected] = useState<EventItem | null>(null);

  return (
    <div className="bg-[#151515] rounded-2xl p-4 border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Bookings & Deadlines</h3>
        <div className="text-xs text-gray-400">Click an event for details</div>
      </div>

      <div style={{ height: 360 }} className="rounded-md overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["day", "week", "month"]}
          onSelectEvent={(evt: EventItem) => setSelected(evt)}
          eventPropGetter={(event: EventItem) => {
            const backgroundColor = event.status === "confirmed" ? "#065f46" : "#b45309";
            return { 
              style: { 
                backgroundColor, 
                borderRadius: 6, 
                padding: "4px 6px", 
                color: "white", 
                border: "none",
                fontSize: "12px"
              } 
            };
          }}
          style={{ background: "#0f0f0f" }}
        />
      </div>

      {selected && (
        <div className="mt-3 p-3 bg-[#0f0f0f] rounded-md border border-[#222] text-sm">
          <div className="font-semibold">{selected.title}</div>
          <div className="text-xs text-gray-400">{selected.desc ?? "No details"}</div>
          <div className="text-xs mt-1 text-gray-400">
            {selected.start.toLocaleString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })} — {selected.end.toLocaleString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}
          </div>
        </div>
      )}
    </div>
  );
};
