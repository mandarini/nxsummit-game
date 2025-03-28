import React, { useState } from "react";
import { Plus, ChevronUp, UserCheck, UserX } from "lucide-react";
import type { Attendee } from "../../lib/supabase";

interface AttendeesTableProps {
  attendees: Attendee[];
  onAddPoints: (attendeeId: string, points: number) => Promise<void>;
  onToggleCheckIn: (
    attendeeId: string,
    currentStatus: boolean
  ) => Promise<void>;
}

export default function AttendeesTable({
  attendees,
  onAddPoints,
  onToggleCheckIn,
}: AttendeesTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendees.map((attendee) => (
              <React.Fragment key={attendee.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {attendee.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendee.checked_in
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {attendee.checked_in ? "Checked In" : "Not Checked In"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === attendee.id ? null : attendee.id
                          )
                        }
                        className="text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        {expandedRow === attendee.id ? (
                          <>
                            <ChevronUp size={16} className="mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Plus size={16} className="mr-1" />
                            Add Points
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          onToggleCheckIn(attendee.id, attendee.checked_in)
                        }
                        className={`flex items-center ${
                          attendee.checked_in
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {attendee.checked_in ? (
                          <>
                            <UserX size={16} className="mr-1" />
                            Check Out
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} className="mr-1" />
                            Check In
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === attendee.id && (
                  <tr className="bg-purple-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                          Quick Add:
                        </span>
                        {[1, 2, 5].map((points) => (
                          <button
                            key={points}
                            onClick={() => onAddPoints(attendee.id, points)}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                          >
                            +{points} {points === 1 ? "Point" : "Points"}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
