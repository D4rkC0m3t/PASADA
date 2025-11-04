"use client";
import { Calendar, dateFnsLocalizer, View, NavigateAction } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isToday, addWeeks, addDays } from "date-fns";
import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
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

// Generate dynamic sample events (current week)
const generateSampleEvents = (): EventItem[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addWeeks(today, 1);
  
  return [
    { 
      title: "Site Visit - Client 1", 
      start: new Date(today.setHours(10, 0, 0, 0)), 
      end: new Date(today.setHours(11, 0, 0, 0)), 
      status: "confirmed" 
    },
    { 
      title: "Material Delivery - Project A", 
      start: new Date(tomorrow.setHours(14, 0, 0, 0)), 
      end: new Date(tomorrow.setHours(15, 30, 0, 0)), 
      status: "pending" 
    },
    { 
      title: "Final Handover - Client 3", 
      start: new Date(nextWeek.setHours(9, 0, 0, 0)), 
      end: new Date(nextWeek.setHours(10, 0, 0, 0)), 
      status: "confirmed" 
    },
  ];
};

export const CalendarTimeline = ({ events }: { events?: EventItem[] }) => {
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('week');
  
  const displayEvents = events || generateSampleEvents();
  
  // Handle navigation (Today, Back, Next buttons)
  const handleNavigate = (newDate: Date, _view: View, _action: NavigateAction) => {
    setCurrentDate(newDate);
  };
  
  // Handle view change (Day, Week, Month)
  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glassmorphic-card p-6 relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="card-title">Bookings & Deadlines</h3>
          <p className="body-text text-xs mt-1">Click an event for details</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-button"
        >
          <Plus size={16} />
          Add Event
        </motion.button>
      </div>

      <div style={{ height: 400 }} className="rounded-lg overflow-hidden">
        <Calendar
          localizer={localizer}
          events={displayEvents}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          views={["day", "week", "month"]}
          onSelectEvent={(evt: EventItem) => setSelected(evt)}
          eventPropGetter={(event: EventItem) => {
            const backgroundColor = event.status === "confirmed" ? "#10b981" : "#f59e0b";
            const isTodayEvent = isToday(event.start);
            return { 
              style: { 
                backgroundColor, 
                borderRadius: 8, 
                padding: "6px 8px", 
                color: "white", 
                border: isTodayEvent ? "2px solid #D4AF37" : "none",
                boxShadow: isTodayEvent ? "0 0 10px rgba(212, 175, 55, 0.4)" : "none",
                fontSize: "12px",
                fontWeight: "600"
              } 
            };
          }}
          dayPropGetter={(date) => {
            if (isToday(date)) {
              return {
                style: {
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  borderLeft: "3px solid #D4AF37"
                }
              };
            }
            return {};
          }}
          style={{ background: "rgba(42, 35, 31, 0.5)", color: "#fff8f1" }}
        />
      </div>

      {selected && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-pasada-900 rounded-lg border border-gold-500/20 text-sm"
        >
          <div className="font-semibold text-[#fff8f1] text-base">{selected.title}</div>
          <div className="text-xs text-[#b3b3b3] mt-1">{selected.desc ?? "No additional details"}</div>
          <div className="text-xs mt-2 text-gold-400 font-medium">
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
        </motion.div>
      )}
    </motion.div>
  );
};
