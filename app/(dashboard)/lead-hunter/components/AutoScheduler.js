'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function AutoScheduler({ onSchedule }) {
  const [schedule, setSchedule] = useState({
    startDate: '',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    dailyLimit: 50,
    emailGap: 10,
    sendDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  const days = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  function toggleDay(day) {
    setSchedule((prev) => ({
      ...prev,
      sendDays: prev.sendDays.includes(day)
        ? prev.sendDays.filter((d) => d !== day)
        : [...prev.sendDays, day],
    }));
  }

  return (
    <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-400" />
        Auto Schedule
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">Start Date</label>
          <input
            type="date"
            value={schedule.startDate}
            onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">Start Time</label>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">End Time</label>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">Timezone</label>
          <select
            value={schedule.timezone}
            onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
            className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light focus:outline-none focus:border-indigo-500/50"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">Send Days</label>
          <div className="flex gap-2 flex-wrap">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  schedule.sendDays.includes(day.value)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">
            Daily Limit: {schedule.dailyLimit} emails/day
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={schedule.dailyLimit}
            onChange={(e) => setSchedule({ ...schedule, dailyLimit: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-2">
            Gap Between Emails: {schedule.emailGap} minutes
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={schedule.emailGap}
            onChange={(e) => setSchedule({ ...schedule, emailGap: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-indigo-300 mb-2">Schedule Summary</h4>
          <ul className="text-sm text-neutral-400 space-y-1 font-light">
            <li>Starts: {schedule.startDate || 'Not set'} at {schedule.startTime}</li>
            <li>Window: {schedule.startTime} - {schedule.endTime} {schedule.timezone}</li>
            <li>{schedule.dailyLimit} emails/day, {schedule.emailGap} min apart</li>
            <li>Active: {schedule.sendDays.length} days/week</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => onSchedule(schedule)}
          disabled={!schedule.startDate}
          className="w-full px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-all"
        >
          Confirm Schedule
        </button>
      </div>
    </div>
  );
}
