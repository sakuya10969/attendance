type AttendanceStatus = 'working' | 'completed' | 'holiday' | 'absent'
type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'

export type MemberAttendanceScenario = {
  email: string
  daysAgo: number
  attendance: {
    clockInHour?: number
    clockInMinute?: number
    clockOutHour?: number
    clockOutMinute?: number
    status: AttendanceStatus
    breakWindow?: {
      startHour: number
      startMinute?: number
      endHour?: number
      endMinute?: number
    }
  }
  clockCorrection?: {
    correctedClockInHour: number
    correctedClockInMinute?: number
    correctedClockOutHour: number
    correctedClockOutMinute?: number
    reason: string
    status: 'pending'
  }
}

export type MemberLeaveRequestScenario = {
  email: string
  leaveRequest: {
    startOffsetDays: number
    endOffsetDays: number
    leaveType: 'paid' | 'unpaid' | 'sick' | 'other'
    reason: string
    status: LeaveRequestStatus
  }
}

export type MemberScenario =
  | MemberAttendanceScenario
  | MemberLeaveRequestScenario

export const memberScenarios: MemberScenario[] = [
  {
    email: 'member1@example.com',
    daysAgo: 2,
    attendance: {
      clockInHour: 0,
      clockInMinute: 0,
      clockOutHour: 9,
      clockOutMinute: 30,
      status: 'completed',
      breakWindow: {
        startHour: 4,
        startMinute: 0,
        endHour: 5,
        endMinute: 0,
      },
    },
  },
  {
    email: 'member1@example.com',
    daysAgo: 4,
    attendance: {
      clockInHour: 0,
      clockInMinute: 30,
      clockOutHour: 8,
      clockOutMinute: 0,
      status: 'completed',
    },
    clockCorrection: {
      correctedClockInHour: 0,
      correctedClockInMinute: 0,
      correctedClockOutHour: 8,
      correctedClockOutMinute: 30,
      reason: 'Seeded correction request for admin review.',
      status: 'pending',
    },
  },
  {
    email: 'member1@example.com',
    daysAgo: 5,
    attendance: {
      status: 'holiday',
    },
  },
  {
    email: 'member1@example.com',
    leaveRequest: {
      startOffsetDays: 7,
      endOffsetDays: 8,
      leaveType: 'paid',
      reason: 'Seeded paid leave request.',
      status: 'pending',
    },
  },
  {
    email: 'member2@example.com',
    daysAgo: 1,
    attendance: {
      clockInHour: 0,
      clockInMinute: 10,
      clockOutHour: 9,
      clockOutMinute: 10,
      status: 'completed',
      breakWindow: {
        startHour: 4,
        startMinute: 10,
        endHour: 5,
        endMinute: 0,
      },
    },
  },
  {
    email: 'member2@example.com',
    daysAgo: 3,
    attendance: {
      clockInHour: 0,
      clockInMinute: 20,
      clockOutHour: 8,
      clockOutMinute: 50,
      status: 'completed',
    },
  },
  {
    email: 'member2@example.com',
    leaveRequest: {
      startOffsetDays: 12,
      endOffsetDays: 12,
      leaveType: 'sick',
      reason: 'Seeded sick leave request.',
      status: 'approved',
    },
  },
  {
    email: 'member3@example.com',
    daysAgo: 2,
    attendance: {
      clockInHour: 1,
      clockInMinute: 0,
      clockOutHour: 10,
      clockOutMinute: 15,
      status: 'completed',
      breakWindow: {
        startHour: 5,
        startMinute: 0,
        endHour: 5,
        endMinute: 45,
      },
    },
  },
  {
    email: 'member3@example.com',
    daysAgo: 6,
    attendance: {
      status: 'absent',
    },
  },
  {
    email: 'member3@example.com',
    leaveRequest: {
      startOffsetDays: 3,
      endOffsetDays: 4,
      leaveType: 'other',
      reason: 'Seeded personal leave request.',
      status: 'rejected',
    },
  },
  {
    email: 'member4@example.com',
    daysAgo: 0,
    attendance: {
      clockInHour: 0,
      clockInMinute: 5,
      status: 'working',
      breakWindow: {
        startHour: 4,
        startMinute: 5,
      },
    },
  },
  {
    email: 'member4@example.com',
    daysAgo: 2,
    attendance: {
      clockInHour: 0,
      clockInMinute: 0,
      clockOutHour: 9,
      clockOutMinute: 0,
      status: 'completed',
    },
  },
]
