import '../../core/utils/json_parse.dart';

/// Domain models that mirror the website's `src/types/index.ts`. Anything not
/// modelled here is handled as a raw `Map<String, dynamic>` (a "generic record"),
/// exactly like the website does.

class Worker {
  Worker(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  String get name => asStr(raw['name']);
  String? get fatherName => asStrN(raw['father_name']);
  String get cnic => asStr(raw['cnic']);
  String? get designation => asStrN(raw['designation']);
  num get salaryPerMonth => asDouble(raw['salary_per_month']);
  String get workerType => asStr(raw['worker_type'], 'industry');
  String get status => asStr(raw['status']);
}

class Application {
  Application(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  String get applicationNo => asStr(raw['application_no']);
  String get applicationType => asStr(raw['application_type']);
  String get status => asStr(raw['status']);
  int get workerId => asInt(raw['worker_id']);
  num get recommendedRentAmount => asDouble(raw['recommended_rent_amount']);
  String? get requestedUnitType => asStrN(raw['requested_unit_type']);
}

class Flat {
  Flat(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  String get flatNo => asStr(raw['flat_no']);
  String get flatAddress => asStr(raw['flat_address']);
  int? get flatRooms => asIntN(raw['flat_rooms']);
  String get status => asStr(raw['status'], 'empty');
  int? get colonyId => asIntN(raw['colony_id']);
  double? get latitude => asDoubleN(raw['latitude']);
  double? get longitude => asDoubleN(raw['longitude']);
}

class RentInvoice {
  RentInvoice(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  int get workerId => asInt(raw['worker_id']);
  String get billingMonth => asStr(raw['billing_month']);
  num get rentAmount => asDouble(raw['rent_amount']);
  num get lateFeeAmount => asDouble(raw['late_fee_amount']);
  num get paidAmount => asDouble(raw['paid_amount']);
  num get totalAmount => asDouble(raw['total_amount']);
  String get status => asStr(raw['status']);

  num get balance {
    final b = totalAmount - paidAmount;
    return b < 0 ? 0 : b;
  }
}

class Complaint {
  Complaint(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  String get complaintDesc => asStr(raw['complaint_desc']);
  String get status => asStr(raw['status']);
  int? get workerId => asIntN(raw['worker_id']);
  int? get colonyId => asIntN(raw['colony_id']);
  int? get flatId => asIntN(raw['flat_id']);
  int? get assetId => asIntN(raw['asset_id']);
  String? get complaintType => asStrN(raw['complaint_type']);
  int? get assignedCaretakerId => asIntN(raw['assigned_caretaker_id']);
  double? get latitude => asDoubleN(raw['latitude']);
  double? get longitude => asDoubleN(raw['longitude']);
  String? get createdAt => asStrN(raw['created_at']);
}

class CaretakerTask {
  CaretakerTask(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  int? get assetId => asIntN(raw['asset_id']);
  int? get complaintId => asIntN(raw['complaint_id']);
  int? get flatId => asIntN(raw['flat_id']);
  String get title => asStr(raw['task_title'], asStr(raw['title'], 'Task $id'));
  String get description =>
      asStr(raw['task_description'], asStr(raw['description'], 'Assigned maintenance work'));
  String get status => asStr(raw['status']);
  int? get assignedToUserId => asIntN(raw['assigned_to_user_id']);
  double? get targetLatitude => asDoubleN(raw['target_latitude']);
  double? get targetLongitude => asDoubleN(raw['target_longitude']);
  int get allowedRadiusMeters => asInt(raw['allowed_radius_meters'], 100);
}

class CaretakerAttendance {
  CaretakerAttendance(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  int get userId => asInt(raw['user_id']);
  String? get dutyDate => asStrN(raw['duty_date']);
  String? get loginTime => asStrN(raw['login_time']);
  String? get logoutTime => asStrN(raw['logout_time']);
  String get status => asStr(raw['status'], 'active');
}

class GpsPing {
  GpsPing(this.raw);
  final Map<String, dynamic> raw;

  int get id => asInt(raw['id']);
  int get userId => asInt(raw['user_id']);
  int? get attendanceId => asIntN(raw['attendance_id']);
  double get latitude => asDouble(raw['latitude']);
  double get longitude => asDouble(raw['longitude']);
  String? get recordedAt => asStrN(raw['recorded_at']);
}

class DashboardSummary {
  DashboardSummary(this.raw);
  final Map<String, dynamic> raw;

  factory DashboardSummary.empty() => DashboardSummary(const {});

  int get workers => asInt(raw['workers']);
  int get applications => asInt(raw['applications']);
  int get flats => asInt(raw['flats']);
  int get complaints => asInt(raw['complaints']);
  int get rentUnpaid => asInt(raw['rentUnpaid']);
  int get utilityUnpaid => asInt(raw['utilityUnpaid']);
  int get tasks => asInt(raw['tasks']);
}
