import { formatDateTime } from "../../utils/formatDate";
import { TABLE_CLASSES, TD_CLASSES, TH_CLASSES } from "../../utils/styles";
import RemoveAttendance from "./RemoveAttendance";

export default function AttendanceTable({ records, studentNames, onRemove }) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className={TABLE_CLASSES}>
        <thead className="bg-gray-50">
          <tr>
            <th className={TH_CLASSES}>Student Name</th>
            <th className={TH_CLASSES}>Attendance</th>
            <th className={TH_CLASSES}>Class Name</th>
            <th className={TH_CLASSES}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="hover:bg-gray-50 transition duration-150"
            >
              <td className={TD_CLASSES}>
                {studentNames.get(record.studentId)}
              </td>
              <td className={TD_CLASSES}>
                {formatDateTime(record.attendanceDate)}
              </td>
              <td className={TD_CLASSES}>{record.className}</td>
              <td className={TD_CLASSES}>
                <RemoveAttendance
                  attendanceId={record.id}
                  studentId={record.studentId}
                  attendance={record.attendance}
                  attendanceDate={record.attendanceDate}
                  onRemove={onRemove}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
